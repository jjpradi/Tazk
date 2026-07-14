import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { PARTNER_ADMIN_PREFIX, PARTNER_ADMIN_TOKEN_KEY } from "../config";

export default function AdminTokenGate() {
  const token = window.localStorage.getItem(PARTNER_ADMIN_TOKEN_KEY) || "";
  console.log(token,'admntoken');
  
  if (!token) return <Navigate to={`${PARTNER_ADMIN_PREFIX}/settings`} replace />;
  return <Outlet />;
}
