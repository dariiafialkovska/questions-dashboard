import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { updateQuestion } from "../services/api";
import {toast} from "react-toastify";
const UpdateQuestionForm = ({ question, onClose }) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text,
    difficulty_level: question.difficulty_level,
    cognitive_level: question.cognitive_level,
    course_name: question.course_name,
    context_pages: question.context_pages.join(", "),
    key_concepts: question.key_concepts.join(", "),
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateInputs = () => {
    if (!formData.question_text.trim()) return "Question text is required.";
    if (!formData.difficulty_level) return "Difficulty level is required.";
    if (!formData.cognitive_level) return "Cognitive level is required.";
    if (!formData.course_name.trim()) return "Course name is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Validate the inputs
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    try {
      // Transform data to match the expected structure
      const payload = {
        ...formData,
        context_pages: formData.context_pages
          ? formData.context_pages.split(",").map((page) => parseInt(page.trim()))
          : [],
        key_concepts: formData.key_concepts
          ? formData.key_concepts.split(",").map((key) => key.trim())
          : [],
      };
  
      // Update the question via the API
      await updateQuestion(question.id, payload);
  
      toast.success("Question updated successfully");
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      setError("Failed to update the question. Please try again.");
    }
  };
  

  return (
    <div className="container">
      <h3 className="mb-4">Edit Question</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="questionText" className="form-label">Question Text</label>
          <textarea
            className="form-control"
            id="questionText"
            name="question_text"
            rows="3"
            value={formData.question_text}
            onChange={handleChange}
            placeholder="Enter the question text"
          ></textarea>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="difficultyLevel" className="form-label">Difficulty Level</label>
            <select
              className="form-select"
              id="difficultyLevel"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
            >
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="cognitiveLevel" className="form-label">Cognitive Level</label>
            <select
              className="form-select"
              id="cognitiveLevel"
              name="cognitive_level"
              value={formData.cognitive_level}
              onChange={handleChange}
            >
              <option value="knowledge">Knowledge</option>
              <option value="comprehension">Comprehension</option>
              <option value="application">Application</option>
              <option value="analysis">Analysis</option>
              <option value="synthesis">Synthesis</option>
              <option value="evaluation">Evaluation</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="courseName" className="form-label">Course Name</label>
            <input
              type="text"
              className="form-control"
              id="courseName"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              placeholder="Enter the course name"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="contextPages" className="form-label">Context Pages</label>
            <input
              type="text"
              className="form-control"
              id="contextPages"
              name="context_pages"
              value={formData.context_pages}
              onChange={handleChange}
              placeholder="e.g., 1, 2, 3"
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="keyConcepts" className="form-label">Key Concepts (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="keyConcepts"
            name="key_concepts"
            value={formData.key_concepts}
            onChange={handleChange}
            placeholder="e.g., concept1, concept2"
          />
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary me-2">Update Question</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateQuestionForm;
