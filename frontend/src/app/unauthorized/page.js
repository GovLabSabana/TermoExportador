"use client";

import UnauthorizedClient from "./UnauthorizedClient";
import React from "react";


export default function Page() {
  return (
    <React.Suspense fallback={<div>Cargando...</div>}>
      <UnauthorizedClient />
    </React.Suspense>
  );
}
