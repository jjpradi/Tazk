import { partnerHttp, adminHttp } from "./client";

/** PUBLIC */
export async function partnerSignup(payload) {
  const res = await partnerHttp.post("/partners/auth/signup", payload);
  return res.data;
}

export async function partnerLogin(payload) {
  const res = await partnerHttp.post("/partners/auth/login", payload);
  return res.data; // { token }
}

/** PARTNER */
export async function getPartnerMe() {
  const res = await partnerHttp.get("/partners/me");
  return res.data;
}

export async function updatePartnerMe(payload) {
  const res = await partnerHttp.put("/partners/me", payload);
  return res.data;
}

export async function uploadKycDoc({ doc_type, file }) {
  const form = new FormData();
  form.append("doc_type", doc_type);
  form.append("file", file);
  const res = await partnerHttp.post("/partners/me/kyc-docs", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function listLeads(params = {}) {
  const res = await partnerHttp.get("/partners/leads", { params });
  return res.data;
}

export async function createLead(payload) {
  const res = await partnerHttp.post("/partners/leads", payload);
  return res.data;
}

export async function updateLead(id, payload) {
  const res = await partnerHttp.put(`/partners/leads/${id}`, payload);
  return res.data;
}

export async function listCommissions(params = {}) {
  const res = await partnerHttp.get("/partners/commissions", { params });
  return res.data;
}

export async function listPayouts() {
  const res = await partnerHttp.get("/partners/payouts");
  return res.data;
}

/** ADMIN (requires JWT with role=admin minted by your main Admin auth system) */
export async function adminListPartners(params = {}) {
  const res = await adminHttp.get("/admin/partners", { params });
  return res.data;
}

export async function adminApprovePartner(id) {
  const res = await adminHttp.post(`/admin/partners/${id}/approve`);
  return res.data;
}

export async function adminApproveBatch(batchId) {
  const res = await adminHttp.post(`/admin/payouts/batches/${batchId}/approve`);
  return res.data;
}

export async function adminMarkBatchPaid(batchId) {
  const res = await adminHttp.post(`/admin/payouts/batches/${batchId}/mark-paid`);
  return res.data;
}
