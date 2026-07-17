import api from "./axios";

export const fetchAgents = (params: { page: number; limit: number; status?: string; search?: string }) =>
  api.get("/admin/agents", { params });

export const fetchAgentById = (id: string) => api.get(`/admin/agents/${id}`);

export const createAgentApi = (data: { name: string; email: string; password: string }) =>
  api.post("/admin/agents", data);

export const disableAgentApi = (id: string) => api.delete(`/admin/agents/${id}`);