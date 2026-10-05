"use client";

export function RetryButton() {
  return (
    <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
      Try again
    </button>
  );
}
