from flask import Blueprint, request, jsonify
from models import db, Question, ModelAnswer, KeyPoint, SupportingEvidence, Metadata,DifficultyLevel,CognitiveLevel
from sqlalchemy import func
from datetime import datetime
from extensions import cache  # Import the Cache instance
import unicodedata

# Create a Blueprint for the routes
routes = Blueprint("routes", __name__)



def error_response(status_code, code, message, param=None, type=None, doc_url=None):

    response = {
        "status": status_code,
        "body": {
            "error": {
                "code": code,
                "message": message,
                "param": param,
            }
        }
    }
    # Remove keys with `None` values
    response["body"]["error"] = {k: v for k, v in response["body"]["error"].items() if v is not None}
    return jsonify(response), status_code



def format_question_response(question):
    return {
        "id": question.id,
        "question_text": question.question_text,
        "difficulty_level": question.difficulty_level.value,
        "cognitive_level": question.cognitive_level.value,
        "course_name": question.course_name,
        "context_pages": question.context_pages,
        "key_concepts": question.key_concepts,
        "grading_criteria": question.grading_criteria,
        "model_answer": {
            "main_argument": question.model_answer.main_argument,
            "conclusion": question.model_answer.conclusion,
            "key_points": [kp.key_point for kp in question.model_answer.key_points],
            "supporting_evidence": [
                {"point": se.point, "page_reference": se.page_reference}
                for se in question.model_answer.supporting_evidence
            ],
        } if question.model_answer else None,
    }


def normalize_query(query):
    if query:
        return unicodedata.normalize("NFKD", query).casefold()
    return query

@routes.route("/questions", methods=["GET"])
@cache.cached(timeout=300, query_string=True)  # Cache results for 5 minutes
def get_questions():
    # Get pagination parameters
    page = request.args.get("page", 1, type=int)  # Default page is 1
    page_size = request.args.get("page_size", 8, type=int)  # Default page size is 10

    # Paginate the questions and order by ID
    paginated_questions = Question.query.order_by(Question.id).paginate(
        page=page, per_page=page_size, error_out=False
    )

    result = {
        "questions": [format_question_response(q) for q in paginated_questions.items],
        "pagination": {
            "current_page": paginated_questions.page,
            "total_pages": paginated_questions.pages,
            "total_items": paginated_questions.total,
            "page_size": paginated_questions.per_page,
        },
    }
    return jsonify(result)


@routes.route("/questions", methods=["POST"])
def add_question():
    data = request.json
    if not data:
        return error_response(
            status_code=400,
            code="missing_request_body",
            message="The request body is missing or invalid.",
            param="body",
            type="invalid_request_error",
            doc_url="https://docs.example.com/error-codes/missing-request-body"
        )
    try:
        question = Question(
            id=data["id"],
            question_text=data["question_text"],
            difficulty_level=data["difficulty_level"],
            cognitive_level=data["cognitive_level"],
            course_name=data["course_name"],
            context_pages=data["context_pages"],
            key_concepts=data["key_concepts"],
            grading_criteria=data["grading_criteria"]
        )
        db.session.add(question)
        db.session.commit()
        return jsonify({
            "status": 201,
            "message": "Question added successfully!"
        }), 201
    except Exception as e:
        return error_response(
            status_code=500,
            code="server_error",
            message="An internal server error occurred."
        )

@routes.route("/questions/<string:id>", methods=["GET"])
@cache.cached(timeout=300, query_string=True)  # Cache results for 5 minutes
def get_question(id):
    question = Question.query.get(id)
    if not question:
        return error_response(
            status_code=404,
            code="resource_missing",
            message=f"No such question with id: '#{id}'.",
            param="id",
            type="invalid_request_error"
            )
    return jsonify(format_question_response(question)), 200




@routes.route("/metadata", methods=["GET"])
def get_metadata():
    total_questions = Question.query.count()
    coverage_pages = list(set(page for q in Question.query.all() for page in q.context_pages))
    primary_topics = list(set(q.course_name for q in Question.query.all()))

    return {
        "total_questions": total_questions,
        "coverage_pages": coverage_pages,
        "primary_topics": primary_topics,
    }



@routes.route("/questions/<string:id>", methods=["PUT"])
def update_question(id):
    question = Question.query.get(id)
    if not question:
        return error_response(404, "Question not found")

    data = request.json
    if not data:
        return error_response(400, "Missing request body")

    try:
        # Ensure enums are mapped correctly
        difficulty_level = data.get("difficulty_level")
        if difficulty_level:
            try:
                question.difficulty_level = DifficultyLevel[difficulty_level.upper()]
            except KeyError:
                return error_response(400, f"Invalid difficulty level: {difficulty_level}")

        cognitive_level = data.get("cognitive_level")
        if cognitive_level:
            try:
                question.cognitive_level = CognitiveLevel[cognitive_level.upper()]
            except KeyError:
                return error_response(400, f"Invalid cognitive level: {cognitive_level}")

        # Update other fields
        question.question_text = data.get("question_text", question.question_text)
        question.course_name = data.get("course_name", question.course_name)
        question.context_pages = data.get("context_pages", question.context_pages)
        question.key_concepts = data.get("key_concepts", question.key_concepts)
        question.grading_criteria = data.get("grading_criteria", question.grading_criteria)

        db.session.commit()
        # Invalidate cache
        cache.clear()
        return {"message": "Question updated successfully!"}
    except Exception as e:
        return error_response(500, str(e))


@routes.route("/questions/<string:id>", methods=["DELETE"])
def delete_question(id):
    question = Question.query.get(id)
    if not question:
        return error_response(404, "Question not found")
    try:
        db.session.delete(question)
        db.session.commit()
        # Invalidate cache
        cache.clear()
        return {"message": f"Question with id {id} deleted successfully!"}
    except Exception as e:
        return error_response(500, f"Failed to delete question: {str(e)}")


@routes.route("/questions/filter", methods=["GET"])
@cache.cached(timeout=300, query_string=True)  # Cache results for 5 minutes
def get_filtered_questions():
    # Get query parameters
    difficulty_level = request.args.get("difficulty_level")
    cognitive_level = request.args.get("cognitive_level")
    course_name = request.args.get("course_name")
    context_pages = request.args.getlist("context_pages", type=int)
    search_query = normalize_query(request.args.get("search"))
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 8, type=int)

    # Start with the base query
    query = Question.query

    # Apply filters if provided
    if difficulty_level:
        query = query.filter(Question.difficulty_level == DifficultyLevel[difficulty_level.upper()])

    if cognitive_level:
        query = query.filter(Question.cognitive_level == CognitiveLevel[cognitive_level.upper()])

    if course_name:
        query = query.filter(Question.course_name.ilike(f"%{course_name}%"))  # Case-insensitive match

    if context_pages:
        query = query.filter(Question.context_pages.op("&&")(context_pages))

    if search_query:
        query = query.filter(func.lower(Question.question_text).contains(search_query.lower()))

    # Total count of filtered questions (before pagination)
    total_count = query.count()

    # Apply pagination
    questions = query.offset((page - 1) * page_size).limit(page_size).all()

    # Format the response
    result = {
        "questions": [format_question_response(q) for q in questions],
        "pagination": {
            "current_page": page,
            "total_pages": (total_count + page_size - 1) // page_size,
            "total_items": total_count,
            "page_size": page_size,
        },
    }
    return jsonify(result)

@routes.errorhandler(400)
def bad_request(e):
    return error_response(400, "Bad Request")

@routes.errorhandler(404)
def not_found(e):
    return error_response(404, "Not Found")

@routes.errorhandler(500)
def internal_server_error(e):
    return error_response(500, "Internal Server Error")
