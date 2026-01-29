import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost/ClearMind/clearmind-backend", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export default axiosClient;
