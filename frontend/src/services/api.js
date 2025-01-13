import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

export const fetchQuestions = async ({ page = 1, page_size = 8, ...filters } = {}) => {
    const queryString = new URLSearchParams({
        page,
        page_size,
        ...filters,
    }).toString();

    try {
        const response = await axios.get(`${API_URL}/questions?${queryString}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
};

export const fetchMetadata = async () => {
  const response = await axios.get(`${API_URL}/metadata`);
  return response.data;
};

export const updateQuestion = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/questions/${id}`, data);
      return response.data;
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.error?.message || "Failed to update the question.";
      throw new Error(errorMessage); // Propagate error message
    }
};
  
export const deleteQuestion = async (id) => {
const response = await axios.delete(`${API_URL}/questions/${id}`);
return response.data;
};
  

export const fetchFilteredQuestions = async (filters = {}) => {
    // Construct query parameters
    const queryString = Object.keys(filters).length
      ? `?${new URLSearchParams(
          Object.entries(filters).filter(([_, value]) => value) // Include only non-empty filters
        ).toString()}`
      : ""; // No query string if filters are empty
  
    try {
      const response = await axios.get(`${API_URL}/questions/filter${queryString}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered questions:", error);
      throw error;
    }
  };
  
