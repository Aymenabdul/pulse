import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getCookieConfig = () => ({
  expires: 0.5,  // Cookie expiry time (half a day)
  secure: window.location.protocol === 'https:',  // Set to true only in production with HTTPS
  sameSite: 'strict',  // Cookie SameSite policy
});

// Check if the token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < (currentTime + 300);  // Allow a 5-minute buffer for expired tokens
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);  // Convert exp to a readable date
  } catch (error) {
    console.error("Error decoding token expiration:", error);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = Cookies.get("esa-token");

        // If a token exists, check if it's expired
        if (savedToken) {
          if (isTokenExpired(savedToken)) {
            logout();  // Log out if the token is expired
            setLoading(false);
            return;
          }
          setToken(savedToken);

          // Fetch user details with the token
          const userDetails = await getUserDetails(savedToken);
          if (userDetails) {
            setUser(userDetails);
            setupTokenExpirationHandler(savedToken);
          } else {
            logout();  // Log out if the user details are not found
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        logout();  // Log out if an error occurs
      } finally {
        setLoading(false);  // Stop loading after the auth initialization
      }
    };

    initializeAuth();  
  }, []);  

  const setupTokenExpirationHandler = (token) => {
    const expiration = getTokenExpiration(token);
    if (!expiration) return;

    const timeUntilExpiry = expiration.getTime() - Date.now();
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        logout();  
      }, timeUntilExpiry);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      if (response.status === 200) {
        const { token, message } = response.data;

        if (isTokenExpired(token)) {
          console.error("Received expired token from server");
          return { success: false, message: message };
        }

        // Store token in cookies and state
        Cookies.set("esa-token", token, getCookieConfig());
        setToken(token);

        const userDetails = await getUserDetails(token);
        if (userDetails) {
          setUser(userDetails);
          setupTokenExpirationHandler(token);
        }

        return { success: true };
      } else {
        throw new Error("Login failed");
      }
    } catch (e) {
      console.error("Login failed: ", e);
      return { success: false, message: e.response?.data?.message || "Unknown error" };
    }
  };

  const logout = () => {
    const cookieConfig = getCookieConfig();
    Cookies.remove("esa-token", { 
      secure: cookieConfig.secure, 
      sameSite: cookieConfig.sameSite 
    });
    Cookies.remove("User-Details", { 
      secure: cookieConfig.secure, 
      sameSite: cookieConfig.sameSite 
    });
    setToken(null);  // Reset token state
    setUser(null);  // Reset user state
  };

  const getUserDetails = async (tokenToUse = null) => {
    const authToken = tokenToUse || Cookies.get("esa-token");

    if (!authToken) {
      return null;
    }

    if (isTokenExpired(authToken)) {
      logout();
      return null;
    }

    try {
      const response = await axios.get(`${BASE_URL}/user-details`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const userData = response.data;

      Cookies.set("User-Details", JSON.stringify(userData), getCookieConfig());
      setUser(userData);

      return userData;
    } catch (e) {
      console.error("Failed to fetch user details: ", e);

      if (e.response?.status === 401 || e.response?.status === 403) {
        logout();  
      }

      return null;
    }
  };

  // Check if the user is authenticated
  const isAuthenticated = () => {
    return token && !isTokenExpired(token) && user;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        getUserDetails,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
