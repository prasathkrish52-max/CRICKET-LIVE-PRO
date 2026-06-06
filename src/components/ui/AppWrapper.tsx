"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ConnectionErrorNotice } from "./ConnectionErrorNotice";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { connectionError, retryConnection } = useAuth();

  if (connectionError) {
    return (
      <ConnectionErrorNotice 
        errorDetails={connectionError} 
        onRetry={retryConnection} 
      />
    );
  }

  return <>{children}</>;
}
