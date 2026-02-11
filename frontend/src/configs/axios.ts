import axiosDefault from "axios"

const API_URL = new URL('/api', import.meta.env.VITE_API_URL).toString();

const axios = axiosDefault.create({
  baseURL: API_URL,
  withCredentials: true
});

export default axios;