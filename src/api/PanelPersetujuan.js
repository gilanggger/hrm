/**
 * ============================================================
 * FILE: src/api/PanelPersetujuan.js
 * ============================================================
 */

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API Error ${res.status}`)
  }

  return res.json()
}

/* ============================================================
   GET ALL APPROVALS
============================================================ */
// GET /api/approvals
export const getApprovals = () =>
  apiFetch('/approvals')

/* ============================================================
   APPROVE
============================================================ */
// PATCH /api/approvals/:id/approve
export const approveApproval = (id) =>
  apiFetch(`/approvals/${id}/approve`, {
    method: 'PATCH',
  })

/* ============================================================
   REJECT
============================================================ */
// PATCH /api/approvals/:id/reject
export const rejectApproval = (id, reason) =>
  apiFetch(`/approvals/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({
      reason,
    }),
  })