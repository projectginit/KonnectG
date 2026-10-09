import { createContext, useEffect, useState } from "react";
import apiRequest from "../services/api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ==========================================================
                    RESTORE USER SESSION
  ========================================================== */

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("konnectg_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/users/me");

        setUser(data.user);
      } catch (error) {
        console.error("Session restore error:", error.message);

        localStorage.removeItem("konnectg_token");
        localStorage.removeItem("konnectg_user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ==========================================================
                          LOGIN
  ========================================================== */

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem("konnectg_token", data.token);

    localStorage.setItem("konnectg_user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  /* ==========================================================
                        REGISTER
  ========================================================== */

  const register = async ({ name, email, phone, password, role = "user" }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role,
      }),
    });

    /*
     * Registration no longer logs the user in.
     *
     * The backend creates the account with:
     * emailVerified = false
     *
     * The user must verify their email before
     * they can log in and receive a JWT.
     */

    return data;
  };

  /* ==========================================================
                          LOGOUT
  ========================================================== */

  const logout = () => {
    localStorage.removeItem("konnectg_token");
    localStorage.removeItem("konnectg_user");

    setUser(null);
  };

  /* ==========================================================
                    REFRESH CURRENT USER
  ========================================================== */

  const refreshUser = async () => {
    const token = localStorage.getItem("konnectg_token");

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const data = await apiRequest("/users/me");

      setUser(data.user);

      localStorage.setItem("konnectg_user", JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error("Refresh user error:", error.message);

      if (error.status === 401 || error.status === 403) {
        logout();
      }

      throw error;
    }
  };

  /* ==========================================================
                        AUTH STATE
  ========================================================== */

  const isAuthenticated = Boolean(user);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
