export function getNow(req) {
    const isTestMode = process.env.TEST_MODE === "1";
    if (!isTestMode) {
        return new Date();
    }

    const headerValue = req.headers.get("x-test-now-ms");
    if (headerValue == null || headerValue === "") {
        return new Date();
    }

    const ms = Number(headerValue);
    if (!Number.isFinite(ms)) {
        return new Date();
    }

    return new Date(ms);
}

export function formatDateTimeIST(value) {
    if (value == null) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
    }).format(date);
}
