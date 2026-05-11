import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("kidzvi_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Fetch the current user on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        setUser(res.data.data || res.data.user || res.data);
      } catch {
        localStorage.removeItem("kidzvi_token");
        localStorage.removeItem("kidzvi_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const handleAuthResponse = useCallback((res) => {
    const { token: newToken, user: newUser, data } = res.data;
    const userData = newUser || data?.user || data;
    const tokenValue = newToken || data?.token;
    localStorage.setItem("kidzvi_token", tokenValue);
    localStorage.setItem("kidzvi_user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    return handleAuthResponse(res);
  }, [handleAuthResponse]);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await authApi.googleLogin(credential);
    return handleAuthResponse(res);
  }, [handleAuthResponse]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem("kidzvi_token");
      localStorage.removeItem("kidzvi_user");
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
