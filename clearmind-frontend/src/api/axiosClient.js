import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost/ClearMind/clearmind-backend",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allow cookies if needed for CORS
});

export default axiosClient;
