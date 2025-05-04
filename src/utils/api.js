import axios from 'axios';

// Base URL for API
const apiUrl = 'http://localhost:5000/api/'; // Replace with your actual backend URL

// Fetch all quotes for a specific need
export const fetchQuotesByNeed = async (needId) => {
  try {
    const response = await axios.get(`${apiUrl}quotes/${needId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotes: ", error);
    throw error;
  }
};

// Submit a new quote
export const submitQuote = async (quoteData) => {
  try {
    const response = await axios.post(`${apiUrl}quotes`, quoteData);
    return response.data;
  } catch (error) {
    console.error("Error submitting quote: ", error);
    throw error;
  }
};

// Update an existing quote
export const updateQuote = async (id, updatedData) => {
  try {
    const response = await axios.put(`${apiUrl}quotes/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating quote: ", error);
    throw error;
  }
};

// Delete a quote
export const deleteQuote = async (id) => {
  try {
    const response = await axios.delete(`${apiUrl}quotes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting quote: ", error);
    throw error;
  }
};
