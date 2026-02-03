import axios from "axios";

const axiosClient = axios.create({
  // base sa url mo ung aken eto ung localhost ko nakafolder pa ng isa.
  baseURL: "http://localhost/ClearMind/clearmind-backend",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export default axiosClient;
