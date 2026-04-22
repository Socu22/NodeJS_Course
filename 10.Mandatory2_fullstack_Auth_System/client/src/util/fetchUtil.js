import { BASE_URL } from "../store/urlStore";

const DEFAULT_TIMEOUT = 10000;

function createAbortController(timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, timeout);

    return { controller, timer };
}

async function request(endpoint, options = {}, timeout = DEFAULT_TIMEOUT) {
    const url = `${BASE_URL}${endpoint}`;

    const { controller, timer } = createAbortController(timeout);

    try {
        const response = await fetch(url, {
            ...options,
            credentials: "include",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        clearTimeout(timer);

        // Safer JSON handling (prevents crash on empty responses)
        let data;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        return {
            ok: response.ok,
            status: response.status,
            data
        };

    } catch (error) {
        clearTimeout(timer);

        if (error.name === "AbortError") {
            return {
                ok: false,
                status: 408,
                data: { errorMessage: "Request timeout" }
            };
        }

        console.error("Fetch error:", error);

        return {
            ok: false,
            status: 0,
            data: { errorMessage: "Network error" }
        };
    }
}

// --- Helpers ---
export const fetchGet = (endpoint, timeout) =>
    request(endpoint, { method: "GET" }, timeout);

export const fetchPost = (endpoint, body, timeout) =>
    request(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    }, timeout);

export const fetchPut = (endpoint, body, timeout) =>
    request(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    }, timeout);

export const fetchPatch = (endpoint, body, timeout) =>
    request(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body)
    }, timeout);

export const fetchDelete = (endpoint, timeout) =>
    request(endpoint, { method: "DELETE" }, timeout);

