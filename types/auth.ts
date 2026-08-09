/** Mirrors the backend's UserRole enum (app/models/user.py). */
export type UserRole = "admin" | "editor" | "author";

/** Safe, public user shape — never carries a password or password hash. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
