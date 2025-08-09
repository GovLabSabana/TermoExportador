"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/hooks/useLogin";
import { useAuthContext } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { login, isSubmitting, formErrors, clearFormErrors } = useLogin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, redirectTo]);

  useEffect(() => {
    clearFormErrors();
  }, [clearFormErrors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific errors when user starts typing
    if (formErrors[name]) {
      clearFormErrors();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const result = await login(formData.email, formData.password, redirectTo);

    if (!result.success && result.errors?.general) {
      // Form errors are handled by the hook
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              crea una cuenta nueva
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {formErrors.general && (
              <Alert type="error">{formErrors.general}</Alert>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  <span className="text-sm text-gray-500">
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center"
              disabled={isSubmitting || !formData.email || !formData.password}
              loading={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
