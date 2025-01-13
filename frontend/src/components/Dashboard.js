import React, { useState, useEffect } from "react";
import {
    fetchQuestions,
    fetchMetadata,
    fetchFilteredQuestions,
} from "../services/api";
import QuestionCard from "./QuestionCard";
import Metadata from "./Metadata";
import Pagination from "./Pagination";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        page_size: 8,
    });
    const [filters, setFilters] = useState({
        difficulty_level: "",
        cognitive_level: "",
        course_name: "",
        context_pages: "",
        search: "",
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    const loadQuestions = async (page = 1, pageSize = 10, filtersToApply = {}) => {
        setLoading(true);
        try {
            const response = await fetchQuestions({
                page,
                page_size: pageSize,
                ...filtersToApply,
            });
            setQuestions(response.questions);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const metadataData = await fetchMetadata();
            setMetadata(metadataData);
        } catch (error) {
            console.error("Error loading metadata:", error);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            const response = await fetchFilteredQuestions({
                ...filters,
                page: 1,
                page_size: pagination.page_size,
            });
            setQuestions(response.questions);
            setPagination(response.pagination);
            setAppliedFilters(filters);
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            difficulty_level: "",
            cognitive_level: "",
            course_name: "",
            context_pages: "",
            search: "",
        });
        setAppliedFilters({});
        loadQuestions(1, pagination.page_size);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handlePageChange = (newPage) => {
        loadQuestions(newPage, pagination.page_size, appliedFilters);
    };

    useEffect(() => {
        loadQuestions();
        loadMetadata();
    }, []);

    if (loading) return <div className="text-center py-5">Loading dashboard...</div>;

    return (
        <div className="container my-5">
<div className="container">
    {/* Header Section */}
    <div className="d-flex align-items-center mb-4 flex-wrap">
        {/* Logo Section */}
        <div className="me-3 text-center text-md-start">
            <img
                src="/images/madlen.avif"
                alt="Logo"
                style={{ maxHeight: "80px", maxWidth: "100%" }} // Adjust for responsiveness
            />
        </div>

        {/* Centered Text Section */}
        <div className="flex-grow-1 text-center">
            <h1 className="mb-0">Dashboard</h1>
        </div>
    </div>

    {/* Content Section */}
    <div className="row">
        {/* Filters Panel */}
        <div className="col-lg-8 col-md-12 mb-4 d-flex">
            <div
                className="card flex-grow-1"
                style={{
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Updated shadow
                    borderRadius: "16px", // Updated radius
                    backgroundColor: "#ffffff", // Ensure background is white
                    padding: "24px", // Add padding for spacing
                }}
            >
                <div className="card-header">
                    <h5 className="mb-0">Filters</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-3">
                            <label htmlFor="difficulty_level" className="form-label">
                                Difficulty Level
                            </label>
                            <select
                                name="difficulty_level"
                                id="difficulty_level"
                                className="form-select"
                                onChange={handleFilterChange}
                                value={filters.difficulty_level}
                            >
                                <option value="">All</option>
                                <option value="basic">Basic</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-3">
                            <label htmlFor="cognitive_level" className="form-label">
                                Cognitive Level
                            </label>
                            <select
                                name="cognitive_level"
                                id="cognitive_level"
                                className="form-select"
                                onChange={handleFilterChange}
                                value={filters.cognitive_level}
                            >
                                <option value="">All</option>
                                <option value="knowledge">Knowledge</option>
                                <option value="comprehension">Comprehension</option>
                                <option value="application">Application</option>
                                <option value="analysis">Analysis</option>
                                <option value="synthesis">Synthesis</option>
                                <option value="evaluation">Evaluation</option>
                            </select>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-3">
                            <label htmlFor="course_name" className="form-label">
                                Course Name
                            </label>
                            <select
                                name="course_name"
                                id="course_name"
                                className="form-select"
                                onChange={handleFilterChange}
                                value={filters.course_name}
                            >
                                <option value="">All</option>
                                {metadata.primary_topics?.map((topic, index) => (
                                    <option key={index} value={topic}>
                                        {topic}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 mb-3">
                            <label htmlFor="context_pages" className="form-label">
                                Context Pages
                            </label>
                            <div className="d-flex flex-wrap">
                                {metadata.coverage_pages?.map((page, index) => (
                                    <div key={index} className="form-check me-3 mb-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`page_${index}`}
                                            name="context_pages"
                                            value={page}
                                            checked={filters.context_pages
                                                .split(",")
                                                .map(Number)
                                                .includes(page)}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                setFilters((prevFilters) => {
                                                    const currentPages = prevFilters.context_pages
                                                        ? prevFilters.context_pages.split(",").map(Number)
                                                        : [];
                                                    if (e.target.checked) {
                                                        return {
                                                            ...prevFilters,
                                                            context_pages: [...currentPages, value].join(","),
                                                        };
                                                    } else {
                                                        return {
                                                            ...prevFilters,
                                                            context_pages: currentPages.filter((p) => p !== value).join(","),
                                                        };
                                                    }
                                                });
                                            }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`page_${index}`}
                                        >
                                            {page}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="search" className="form-label">
                            Search by Question Text
                        </label>
                        <input
                            type="text"
                            id="search"
                            name="search"
                            className="form-control"
                            placeholder="Enter search text"
                            onChange={handleFilterChange}
                            value={filters.search}
                        />
                    </div>

                    <div className="d-flex justify-content-end">
                        <button className="btn btn-primary me-2" onClick={applyFilters}>
                            Apply Filters
                        </button>
                        <button className="btn btn-secondary" onClick={resetFilters}>
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Metadata */}
        <div className="col-lg-4 col-md-12 d-flex">
            <Metadata metadata={metadata} />
        </div>
    </div>
</div>

            <div className="container">
                           {/* Questions List */}
<div className="row g-4 ">
    {questions.length > 0 ? (
        questions.map((q) => (
            <div className="col-md-6 col-lg-4" key={q.id}>
                <QuestionCard
                    question={q}
                    onUpdate={() =>
                        loadQuestions(
                            pagination.current_page,
                            pagination.page_size,
                            appliedFilters
                        )
                    }
                />
            </div>
        ))
    ) : (
        <div className="text-center w-100">
            <p className=" text-danger">There are no questions matching the selected filters.</p>
        </div>
    )}
</div>  
            </div>

            {/* Pagination */}
            <div className="mt-4">
                <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default Dashboard;
