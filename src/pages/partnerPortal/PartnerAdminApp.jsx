import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PARTNER_ADMIN_PREFIX } from "./config";
import AdminTokenGate from "./auth/AdminTokenGate";

import AdminSettings from "./admin/AdminSettings";
import AdminPartnersPage from "./admin/AdminPartnersPage";
import AdminPayoutActionsPage from "./admin/AdminPayoutActionsPage";

export default function PartnerAdminApp() {
  return (
    <Routes>
      <Route path="settings" element={<AdminSettings />} />

      <Route element={<AdminTokenGate />}>
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="payouts" element={<AdminPayoutActionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={`${PARTNER_ADMIN_PREFIX}/settings`} replace />} />
    </Routes>
  );
}
