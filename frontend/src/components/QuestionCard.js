import React, { useState } from "react";
import { deleteQuestion } from "../services/api";
import UpdateQuestionForm from "./UpdateQuestionForm";
import Modal from "./Modal";
import { toast } from "react-toastify";

const QuestionCard = ({ question, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteQuestion(question.id);
            toast.success("Question deleted successfully");
            onUpdate(); // Refresh the questions list
            setIsDeleteModalOpen(false); // Close the modal
        } catch (error) {
            console.error("Error deleting question:", error);
            toast.error("Error deleting question");
        }
    };

    const handleUpdate = () => {
        setIsEditing(false);
        onUpdate();
    };

    return (
        <div
            className="card mb-4"
            style={{
                width: "100%",
                maxWidth: "350px",
                display: "flex",
                flexDirection: "column",
                height: "100%", // Ensure cards take full height
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Updated shadow
                    borderRadius: "16px", // Updated radius
                    backgroundColor: "#ffffff", // Ensure background is white
                    padding: "24px", // Add padding for spacing
                }}
        >
            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">Question {question.id}</h5>
                <p className="card-text">{question.question_text}</p>

                <p className="mb-2">
                    <strong>Course Name:</strong> {question.course_name}
                </p>
                <p className="mb-2">
                    <strong>Difficulty:</strong> {question.difficulty_level}
                </p>
                <p className="mb-2">
                    <strong>Cognitive Level:</strong> {question.cognitive_level}
                </p>
                <p className="mb-2">
                    <strong>Context Pages:</strong>
                </p>
                <div className="d-flex flex-wrap mb-3">
                    {question.context_pages.map((page) => (
                        <button
                            key={page}
                            className="btn btn-link p-0 me-2"
                            style={{ textDecoration: "none", color: "blue" }}
                            onClick={() => window.open(`/course_content.pdf#page=${page}`, "_blank")}
                        >
                            Page {page}
                        </button>
                    ))}
                </div>

                <p className="mb-3">
                    <strong>Key Concepts:</strong> {question.key_concepts.join(", ")}
                </p>
                <div className="mt-auto d-flex">
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title="Edit Question"
            >
                <UpdateQuestionForm question={question} onClose={handleUpdate} />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to delete this question?</p>
                <div className="mt-3 d-flex">
                    <button
                        className="btn btn-danger me-3"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default QuestionCard;
