"use client";

import { useEffect } from "react";

const COOKIE_NAME = "ccp_anon";
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getOrCreateAnonId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match) return decodeURIComponent(match[1].trim());
  const id = crypto.randomUUID();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  return id;
}

export function AnonCookie() {
  useEffect(() => {
    getOrCreateAnonId();
  }, []);
  return null;
}
