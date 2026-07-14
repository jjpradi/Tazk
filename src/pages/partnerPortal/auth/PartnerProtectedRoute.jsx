import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PARTNER_PORTAL_PREFIX } from "../config";
import { usePartnerAuth } from "./PartnerAuthContext";

export default function PartnerProtectedRoute() {
  const { token, loading } = usePartnerAuth();
  const location = useLocation();
  
  if (loading) return null; // keep minimal; your app likely has a loader component
  if (!token) return <Navigate to={`${PARTNER_PORTAL_PREFIX}/login`} replace state={{ from: location }} />;
  return <Outlet />;
}
