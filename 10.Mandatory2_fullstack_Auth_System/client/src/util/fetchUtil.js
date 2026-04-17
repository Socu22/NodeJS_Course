import { BASE_URL } from "../store/urlStore";



async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint }`, {
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json();

        return {
            ok: response.ok,
            status: response.status,
            data
        };

    } catch (error) {
        console.error("Fetch error:", error);

        return {
            ok: false,
            status: 0,
            data: { errorMessage: "Network error" }
        };
    }
}

export function fetchGet(endpoint) {
    return request(endpoint, {
        method: "GET"
    });
}

export function fetchPost(endpoint, body) {
    return request(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}
export function fetchPut(endpoint, body) {
    return request(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}
export function fetchPatch(endpoint, body) {
    return request(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}
export function fetchDelete(endpoint) {
    return request(endpoint, {
        method: "DELETE"
    });
}

export function fetchMe() {
    return fetchGet("/users/me");
}