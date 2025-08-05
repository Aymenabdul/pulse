import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("esa-token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401 || error.response.status === 403) {
//       Cookies.remove("esa-token");
//       Cookies.remove("User-Details");

//       window.location.href = "/login"; 
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;