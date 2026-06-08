const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const authFetch = async (URL, options = {}) => {
    const response = await fetch(URL, options);
    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }
    return response;
}

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});


//Master Data APIs
export const getRequestTypes = async (token) => {
    const res = await authFetch(`${SERVER_URL}/master/request-types`, {
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch request types")
    return data
}

export const getSuppliersByType = async (token, typeId) => {
    const res = await authFetch(`${SERVER_URL}/master/suppliers?typeId=${typeId}`, {
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch suppliers")
    return data
}

export const getItemsBySupplier = async (token, supplierId) => {
    const res = await authFetch(`${SERVER_URL}/master/supplier-items?supplierId=${supplierId}`, {
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch supplier items")
    return data
}

// Requester APIs
export const getMyRequests = async (token) => {
    const allRequests = await authFetch(`${SERVER_URL}/request/mine`, {
        headers: authHeaders(token),
    });
    const dataToRead = await allRequests.json();
    return dataToRead;
};

export const submitRequest = async (token, form) => {
    const res = await authFetch(`${SERVER_URL}/request`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create request");
    return data;
}

export const editingRequest = async (token, requestId, form) => {
    const res = await authFetch(`${SERVER_URL}/request/${requestId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to edit request");
    return data;
}


//Approver APIs
export const getPendingRequests = async(token) =>{
    const res = await authFetch(`${SERVER_URL}/request/pending`, {
        headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch pending requests")
    return data;
}

export const approveRequest = async(token, requestId) =>{
    const res = await authFetch(`${SERVER_URL}/request/${requestId}/approve`, {
        method: "PATCH",
        headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to approve request")
    return data;
}

export const rejectRequest = async(token, requestId) =>{
    const res = await authFetch(`${SERVER_URL}/request/${requestId}/reject`, {
        method: "PATCH",
        headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reject request")
    return data;
}

//Procure Manager APIs
export const getApprovedRequests = async (token) => {
    const res = await authFetch(`${SERVER_URL}/request/approved`, {
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch approved requests")
    return data
}

export const setProcessing = async (token, requestId) => {
    const res = await authFetch(`${SERVER_URL}/request/${requestId}/processing`, {
        method: "PATCH",
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to set processing")
    return data
}

export const completeRequest = async (token, requestId) => {
    const res = await authFetch(`${SERVER_URL}/request/${requestId}/complete`, {
        method: "PATCH",
        headers: authHeaders(token),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to complete request")
    return data
}

export const addSupplier = async (token, data) => {
    const res = await authFetch(`${SERVER_URL}/procure/suppliers`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to add supplier")
    return result
}

export const editSupplier = async (token, supplierId, data) => {
    const res = await authFetch(`${SERVER_URL}/procure/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to edit supplier")
    return result
}

export const removeSupplier = async (token, supplierId) => {
    const res = await authFetch(`${SERVER_URL}/procure/suppliers/${supplierId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to delete supplier")
    return result
}

export const addSupplierItem = async (token, supplierId, data) => {
    const res = await authFetch(`${SERVER_URL}/procure/suppliers/${supplierId}/items`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to add item")
    return result
}

export const editSupplierItem = async (token, itemId, data) => {
    const res = await authFetch(`${SERVER_URL}/procure/supplier-items/${itemId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to edit item")
    return result
}

export const removeSupplierItem = async (token, itemId) => {
    const res = await authFetch(`${SERVER_URL}/procure/supplier-items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to delete item")
    return result
}

export const importPriceList = async (token, supplierId, prices) => {
    const res = await authFetch(`${SERVER_URL}/procure/suppliers/${supplierId}/prices`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ prices }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to import prices")
    return result
}

export const priceRequestItems = async (token, requestId, prices) => {
    const res = await authFetch(`${SERVER_URL}/procure/requests/${requestId}/price-items`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ prices }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to price request items")
    return result
}


// Admin APIs
export const getAllUsers = async (token) => {
    const res = await authFetch(`${SERVER_URL}/admin/users`, {
        headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch users");
    return data;
}

export const changeUserRole = async(token, userId, newRole) =>{
    const res = await authFetch(`${SERVER_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role_id: newRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update user role");
    return data.user;
}

export const deleteUser = async(token, userId) =>{
    const res = await authFetch(`${SERVER_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete user");
    return data.message;
}

export const registerUser = async (token, form) => {
    const res = await authFetch(`${SERVER_URL}/admin/register`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to register user");
    return data;
}
