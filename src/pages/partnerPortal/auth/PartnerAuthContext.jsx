import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PARTNER_TOKEN_KEY } from "../config";
import { getPartnerMe, partnerLogin } from "../api/partnerApi";

const PartnerAuthContext = createContext(null);

export function PartnerAuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(PARTNER_TOKEN_KEY) || "");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  const refreshMe = useCallback(async () => {
    if (!token) {
      setMe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getPartnerMe();
      setMe(data);
    } catch (e) {
      // token invalid/expired => logout
      window.localStorage.removeItem(PARTNER_TOKEN_KEY);
      setToken("");
      setMe(null);
      setError("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }) => {
    setError("");
    const { token: t } = await partnerLogin({ email, password });
    window.localStorage.setItem(PARTNER_TOKEN_KEY, t);
    setToken(t);
    await refreshMe();
    return t;
  }, [refreshMe]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(PARTNER_TOKEN_KEY);
    setToken("");
    setMe(null);
  }, []);

  const value = useMemo(() => ({
    token,
    me,
    loading,
    error,
    login,
    logout,
    refreshMe
  }), [token, me, loading, error, login, logout, refreshMe]);

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error("usePartnerAuth must be used inside PartnerAuthProvider");
  return ctx;
}
