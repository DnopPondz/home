"use client";
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.$oid) return value.$oid;
      if (value.toString) return value.toString();
    }
    return String(value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const persistUser = (userData) => {
    try {
      if (!userData) {
        localStorage.removeItem("userData");
        return;
      }

      localStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Persist user error:", error);
    }
  };

  const login = (userData) => {
    if (!userData?._id && !userData?.userId) {
      console.warn("Missing user identifier in userData");
    }

    const normalizedUserId = normalizeId(userData?.userId || userData?._id);
    const normalizedUser = {
      ...userData,
      userId: normalizedUserId || userData?.userId || userData?._id,
    };

    setUser(normalizedUser);
    persistUser(normalizedUser);
  };

  const logout = () => {
    persistUser(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const nextUserRaw =
        typeof updates === "function"
          ? updates(prev)
          : { ...(prev || {}), ...updates };

      if (!nextUserRaw) {
        persistUser(null);
        return null;
      }

      const nextUser = {
        ...nextUserRaw,
        userId: normalizeId(nextUserRaw.userId || nextUserRaw._id) || nextUserRaw.userId,
      };

      persistUser(nextUser);
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
