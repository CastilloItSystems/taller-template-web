import apiClient from "../apiClient";

export const getCustomer = async (id: string) => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const getCustomers = async () => {
  const response = await apiClient.get("/customers");
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await apiClient.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any) => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
};

// Búsqueda de customers
export const searchCustomers = async (query: string) => {
  const response = await apiClient.get(`/customers/search?q=${query}`);
  return response.data;
};

// Obtener customers por tipo
export const getCustomersByType = async (tipo: "persona" | "empresa") => {
  const response = await apiClient.get(`/customers/type/${tipo}`);
  return response.data;
};
