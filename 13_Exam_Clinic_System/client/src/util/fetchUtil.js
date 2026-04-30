import { BASE_URL } from "../store/urlStore";


// ---- TRIM HELPERS ----

function trimValue(value) {
    return typeof value === "string"
        ? value.trim()
        : value;
}

function trimBody(body) {
    if (!body || typeof body !== "object") return body;

    const cleaned = {};

    for (const key in body) {
        cleaned[key] = trimValue(body[key]);
    }

    return cleaned;
}


// ---- CORE REQUEST ----

async function request(endpoint, options = {}) {
    try {
        const trimmedBody = options.body
            ? JSON.stringify(trimBody(JSON.parse(options.body)))
            : undefined;

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options,
            body: trimmedBody
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


// ---- METHODS ----

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