import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";

export default function RequireAuth() {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    // Active validation against the server
    axios
      .get("https://backend.wanij.com/scraper/auth/me/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => setStatus("authenticated"))
      .catch(() => {
        // localStorage.removeItem("token");
        setStatus("unauthenticated");
      });
  }, []);
  1;

  if (status === "loading") {
    return <div>Checking authentication…</div>;
  }

  if (status === "unauthenticated") {
    // Redirect unauthenticated users to signup, preserving destination
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // **This is the crucial piece**: render matched child routes
  return <Outlet />;
}
