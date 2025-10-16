import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
   
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {

    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});


API.interceptors.response.use(
  (res) => res,
  (err) => {
    
    if (err.response && err.response.status === 401) {
      console.log(
        "Unauthorized - Token expired or invalid. Redirecting to login."
      );
      
    }
    return Promise.reject(err);
  }
);

export const fetchTasks = (params) => API.get("/tasks", { params }); // params handles FSP
export const createTask = (formData) =>
  API.post("/tasks", formData, {

    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const downloadDocument = (taskId, storedName) =>
  API.get(
    `/tasks/${taskId}/documents/${storedName}`,
    { responseType: "blob" } 
  );

export const fetchUsers = () => API.get("/users");
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const logoutUser = () => API.post("/auth/logout");

export default API;
