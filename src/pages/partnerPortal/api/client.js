import axios from "axios";
import {
  DEFAULT_PARTNER_SERVICE_BASE_URL,
  PARTNER_TOKEN_KEY,
  PARTNER_ADMIN_TOKEN_KEY
} from "../config";

export function getPartnerToken() {
  return window.localStorage.getItem(PARTNER_TOKEN_KEY) || "";
}

export function getAdminToken() {
  return window.localStorage.getItem(PARTNER_ADMIN_TOKEN_KEY) || "";
}

export const partnerHttp = axios.create({
  baseURL: DEFAULT_PARTNER_SERVICE_BASE_URL,
  timeout: 30000
});

partnerHttp.interceptors.request.use((config) => {
  const token = getPartnerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminHttp = axios.create({
  baseURL: DEFAULT_PARTNER_SERVICE_BASE_URL,
  timeout: 30000
});

adminHttp.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
