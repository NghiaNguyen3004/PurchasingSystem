import { useState, useEffect } from 'react';
import { getMyRequests, submitRequest, editingRequest } from '../services/api.js';

export function useRequest(token) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try{
            const data = await getMyRequests(token);
            setRequests(data);
        } catch (err) {
            setError(err.message || "Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() =>{
        fetchRequests();
    }, [token])

    const submitNewRequest = async (form) => {
        setError("");
        await submitRequest(token, form);
        fetchRequests(); // refresh list after submission
    }
    const edit = async(requestId, form) => {
        await editingRequest(token, requestId, form);
        fetchRequests(); // refresh list after editing
    }

    return { requests, loading, fetchRequests, submitNewRequest, edit };
}