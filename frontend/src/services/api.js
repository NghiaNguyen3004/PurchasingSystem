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


export const getMyRequests = async (token) => {
    const allRequests = await authFetch(`${SERVER_URL}/request/mine`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const dataToRead = await allRequests.json();
    return dataToRead;
};

export const submitRequest = async (token, form) => {
    const res = await authFetch(`${SERVER_URL}/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create request");
    return data;
}

export const getAllUsers = async (token) => {
    const res = await authFetch(`${SERVER_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch users");
    return data.users;
}

export const changeUserRole = async(token, userId, newRole) =>{
    const res = await authFetch(`${SERVER_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update user role");
    return data.user;
}

export const deleteUser = async(token, userId) =>{
    const res = await authFetch(`${SERVER_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete user");
    return data.message;
}

export const registerUser = async (token, form) => {
    const res = await authFetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to register user");
    return data;
}
