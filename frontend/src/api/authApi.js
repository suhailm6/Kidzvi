import api from "./axiosConfig";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const googleLogin = (credential) => api.post("/auth/google", { credential });
export const getMe = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout");
