import api from "./axios";

export const searchCustomers = (q: string) =>
  api.get("/customers/search", { params: { q } });

export const createCustomer = (data: Record<string, any>) =>
  api.post("/customers", data);

export const fetchCustomerById = (id: string) =>
  api.get(`/customers/${id}`);

export const updateCustomer = (id: string, data: Record<string, any>) =>
  api.put(`/customers/${id}`, data);

export const issuePolicy = (data: Record<string, any>) =>
  api.post("/policies/issue", data);

export const fetchPoliciesForCustomer = (customerId: string) =>
  api.get(`/policies/customer/${customerId}`);