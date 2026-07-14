import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const getProperties = (params) => api.get("/properties", { params });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post("/properties", data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const updateStatus = (id, status) => api.patch(`/properties/${id}/status`, { status });

export const uploadImages = (data) => api.post("/upload", data);
export const uploadFile = (formData) => api.post("/upload/file", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteImage = (id) => api.delete(`/upload/${id}`);

export const importPreview = (text) => api.post("/import/preview", { text });
export const importConfirm = (properties) => api.post("/import/confirm", { properties });

export default api;
