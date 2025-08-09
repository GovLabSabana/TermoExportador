import { Suspense } from "react";
import LoginPage from "./Loginpage";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginPage />
    </Suspense>
  );
}
