from flask_sqlalchemy import SQLAlchemy
from enum import Enum as PyEnum

db = SQLAlchemy()

class DifficultyLevel(PyEnum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class CognitiveLevel(PyEnum):
    KNOWLEDGE = "Knowledge"
    COMPREHENSION = "Comprehension"
    APPLICATION = "Application"
    ANALYSIS = "Analysis"
    SYNTHESIS = "Synthesis"
    EVALUATION = "Evaluation"
    
    

class Question(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    difficulty_level = db.Column(db.Enum(DifficultyLevel), nullable=False)
    cognitive_level = db.Column(db.Enum(CognitiveLevel), nullable=False)
    course_name = db.Column(db.String(100), nullable=False)
    context_pages = db.Column(db.ARRAY(db.Integer), nullable=False)
    key_concepts = db.Column(db.ARRAY(db.String), nullable=False)  # Array of strings
    model_answer = db.relationship(
        "ModelAnswer", 
        backref="question", 
        uselist=False, 
        cascade="all, delete-orphan"  # Cascade deletes
    )
    grading_criteria = db.Column(db.ARRAY(db.String), nullable=False)  # Array of strings


class Metadata(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Single metadata entry
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    coverage_pages = db.Column(db.ARRAY(db.Integer), nullable=False)  # Array of integers
    primary_topics = db.Column(db.ARRAY(db.String), nullable=False)  # Array of strings

class ModelAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    main_argument = db.Column(db.Text, nullable=False)
    conclusion = db.Column(db.Text, nullable=False)

    # Foreign Key to link with the Question table
    question_id = db.Column(db.String, db.ForeignKey("question.id"), nullable=False)

    # Relationships
    supporting_evidence = db.relationship(
        "SupportingEvidence", 
        backref="model_answer", 
        cascade="all, delete-orphan", 
        lazy=True
    )
    key_points = db.relationship(
        "KeyPoint", 
        backref="model_answer", 
        cascade="all, delete-orphan", 
        lazy=True
    )
class SupportingEvidence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    point = db.Column(db.Text, nullable=False)
    page_reference = db.Column(db.Integer, nullable=False)

    # Foreign Key to link with the ModelAnswer table
    model_answer_id = db.Column(db.Integer, db.ForeignKey("model_answer.id"), nullable=False)


class KeyPoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key_point = db.Column(db.Text, nullable=False)

    # Foreign Key to link with the ModelAnswer table
    model_answer_id = db.Column(db.Integer, db.ForeignKey("model_answer.id"), nullable=False)
