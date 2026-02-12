export interface JwtParams {
    token: Record<string, unknown>;
    user?: Record<string, unknown>;
}

export interface SessionParams {
    session: Record<string, unknown>;
    token: Record<string, unknown>;
}