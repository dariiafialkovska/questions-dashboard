import React from "react";

const Metadata = ({ metadata }) => {
  return (
    <div className="card mb-4 flex-grow-1"
     style={{
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Updated shadow
                borderRadius: "16px", // Updated radius
                backgroundColor: "#ffffff", // Ensure background is white
                padding: "24px", // Add padding for spacing
            }}
    >
      <div className="card-header">
        <h5 className="mb-0">Metadata</h5>
      </div>
      <div className="card-body">
        <p className="mb-2">
          <strong>Total Questions:</strong> {metadata.total_questions}
        </p>
        <p className="mb-2">
          <strong>Coverage Pages:</strong> {metadata.coverage_pages.join(", ")}
        </p>
        <p className="mb-0">
          <strong>Primary Topics:</strong> {metadata.primary_topics.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default Metadata;
