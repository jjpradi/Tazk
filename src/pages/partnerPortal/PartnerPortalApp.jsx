import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PARTNER_PORTAL_PREFIX } from "./config";
import { PartnerAuthProvider } from "./auth/PartnerAuthContext";
import PartnerProtectedRoute from "./auth/PartnerProtectedRoute";

import PartnerLogin from "./pages/PartnerLogin";
import PartnerSignup from "./pages/PartnerSignup";
import PartnerDashboard from "./pages/PartnerDashboard";
import LeadsPage from "./pages/LeadsPage";
import CommissionsPage from "./pages/CommissionsPage";
import PayoutsPage from "./pages/PayoutsPage";
import ProfilePage from "./pages/ProfilePage";
import KycUploadPage from "./pages/KycUploadPage";

export default function PartnerPortalApp() {
  return (
    <PartnerAuthProvider>
      <Routes>
        {/* <Route path="login" element={<PartnerLogin />} /> */}
        <Route path="signup" element={<PartnerSignup />} />
          <Route path="dashboard" element={<PartnerDashboard />} />

        <Route element={<PartnerProtectedRoute />}>
          <Route path="leads" element={<LeadsPage />} />
          <Route path="commissions" element={<CommissionsPage />} />
          <Route path="payouts" element={<PayoutsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="kyc" element={<KycUploadPage />} />
        </Route>

        <Route path="*" element={<Navigate to={`${PARTNER_PORTAL_PREFIX}/dashboard`} replace />} />
      </Routes>
    </PartnerAuthProvider>
  );
}
