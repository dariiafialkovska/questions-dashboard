import json
from models import db, Question, ModelAnswer, KeyPoint, SupportingEvidence, Metadata
from app import app  # Import your Flask app for the app context
import os
def seed_data(file):
    
    # Load the JSON data
    
    
    with open(f"data/{file}", "r", encoding="utf-8") as file:
        data = json.load(file)

    # Seed Metadata
    metadata = data["metadata"]
    metadata_entry = Metadata(
        total_questions=metadata["total_questions"],
        coverage_pages=metadata["coverage_pages"],
        primary_topics=metadata["primary_topics"],
    )
    db.session.add(metadata_entry)

    # Seed Questions
    for question_data in data["questions"]:
        # Create the Question object
        question = Question(
            id=question_data["id"],
            question_text=question_data["question_text"],
            difficulty_level=question_data["difficulty_level"].upper(),
            cognitive_level=question_data["cognitive_level"].upper(),
            course_name=question_data["course_name"],
            context_pages=question_data["context_pages"],
            key_concepts=question_data["key_concepts"],
            grading_criteria=question_data["grading_criteria"]
        )
        db.session.add(question)

        # Create the ModelAnswer object
        model_answer_data = question_data["model_answer"]
        model_answer = ModelAnswer(
            main_argument=model_answer_data["main_argument"],
            conclusion=model_answer_data["conclusion"],
            question=question
        )
        db.session.add(model_answer)

        # Add KeyPoints
        for key_point in model_answer_data["key_points"]:
            db.session.add(KeyPoint(key_point=key_point, model_answer=model_answer))

        # Add SupportingEvidence
        for evidence in model_answer_data["supporting_evidence"]:
            db.session.add(SupportingEvidence(
                point=evidence["point"],
                page_reference=evidence["page_reference"],
                model_answer=model_answer
            ))

    # Commit changes
    db.session.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    with app.app_context():
        #all files inside data folder
        files= os.listdir("data")
        
        for file in files:
            #seed data for each file
            seed_data(file)
