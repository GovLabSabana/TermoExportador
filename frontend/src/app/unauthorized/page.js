"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard";
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 👇 Redirección controlada fuera del setState
  useEffect(() => {
    if (countdown <= 0) {
      handleLoginRedirect();
    }
  }, [countdown]);

  const handleLoginRedirect = () => {
    const loginUrl = `/login${
      redirectPath && redirectPath !== "/login"
        ? `?redirect=${encodeURIComponent(redirectPath)}`
        : ""
    }`;
    router.push(loginUrl);
  };
  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Lock Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Acceso No Autorizado
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              No tienes permisos para acceder a esta página.
            </p>

            {redirectPath && redirectPath !== "/dashboard" && (
              <p className="mt-1 text-xs text-gray-500">
                Intentabas acceder a:{" "}
                <span className="font-mono">{redirectPath}</span>
              </p>
            )}

            <div className="mt-6 space-y-4">
              <Button onClick={handleLoginRedirect} className="w-full">
                Iniciar Sesión
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Crear cuenta
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Redirigiendo automáticamente a la página de login en{" "}
                    <span className="font-bold">{countdown}</span> segundo
                    {countdown !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
