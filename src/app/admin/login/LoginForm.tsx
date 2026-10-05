"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <span className="pill">Admin</span>
      <h1 className="t-h3">Sign in</h1>
      <label className="field">
        <span className="t-label">Password</span>
        <input className="input" type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
