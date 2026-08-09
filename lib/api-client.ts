import axios from "axios";
import { API_URL } from "@/lib/config";

/**
 * Base Axios client for the FastAPI backend (`/api/v1/*`).
 *
 * This is called from server-side code only (Route Handlers, Server
 * Components) for authenticated admin requests — the browser never talks to
 * the backend directly, which keeps the JWT out of client-side JavaScript.
 * See lib/auth-api.ts and lib/session.ts.
 */
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

/**
 * Same backend, no default Content-Type — for multipart/form-data requests
 * (currently just media upload, see lib/media-api.ts). Sharing `apiClient`
 * for those would ship its fixed `Content-Type: application/json` default,
 * which prevents axios from setting the multipart boundary header itself.
 * A longer timeout accounts for image upload bodies being larger than a
 * typical JSON request.
 */
export const apiClientMultipart = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 20_000,
});
