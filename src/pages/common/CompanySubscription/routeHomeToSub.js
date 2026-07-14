import DashBoardTest from 'pages/common/home/dashboard';
import React from 'react';
import CompanySubscription from '.';
import { getsessionStorage } from 'pages/common/login/cookies';
import { PartnerAdminApp, PartnerPortalApp } from 'pages/partnerPortal';
import SuperAdminDashboard from 'pages/superAdmin/Dashboard';
import DeveloperDashboard from 'pages/developer/Dashboard';
import { useSelector } from 'react-redux';


const RouteHomeAndSub = () => {

  const storage = getsessionStorage();
  const company_type = storage?.company_type;
  const isAdmin = storage?.role_name === 'Administrator'
  const { subscriptionExpired } = useSelector((state) => state.NavigationReducer);
  if (!storage) return null;

  // Show renewal page when subscription expired (title bar stays alive for company switch)
  if (subscriptionExpired || storage.subscriptionRemainingDays === 0) {
    return <CompanySubscription />;
  }

  if (company_type === 13) {
    return isAdmin ? <PartnerAdminApp /> : <PartnerPortalApp />;
  }

  if (Number(company_type) === 6) {
    return <DeveloperDashboard />;
  }

  if (Number(company_type) === 8) {
    return <SuperAdminDashboard />;
  }

  return <DashBoardTest />;
};

export default RouteHomeAndSub;
