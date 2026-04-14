import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";

import { useProfile } from "@/stores/profile";

const ADMIN_ROLE = "ADMIN";

export default function RequiredAdmin({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();

  if (!profile) {
    return <Spin fullscreen />;
  }

  const roles = profile.roles ?? [];
  const isAdmin = roles.some((r) => r.name === ADMIN_ROLE);

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

