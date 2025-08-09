"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/hooks/useRegister";
import { useAuthContext } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";

export default function Register() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const {
    register,
    isSubmitting,
    formErrors,
    showVerificationModal,
    registeredUser,
    handleVerificationModalClose,
    clearFormErrors,
  } = useRegister();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    clearFormErrors();
  }, [clearFormErrors]);

  const handleChange = (e) => {
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

    const result = await register(
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      // The verification modal will be shown automatically
      // via the showVerificationModal state from the hook
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
    <>
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Crear Cuenta
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              O{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                inicia sesión en tu cuenta existente
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
                  onChange={handleChange}
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
                    autoComplete="new-password"
                    required
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={formErrors.confirmPassword}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    <span className="text-sm text-gray-500">
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center"
                disabled={
                  isSubmitting ||
                  !formData.email ||
                  !formData.password ||
                  !formData.confirmPassword
                }
                loading={isSubmitting}
              >
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Al crear una cuenta, aceptas nuestros{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={handleVerificationModalClose}
        title="¡Cuenta Creada Exitosamente!"
        closeOnOverlayClick={false}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verifica tu correo electrónico
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Hemos enviado un enlace de verificación a{" "}
              <strong>{registeredUser?.email}</strong>. Por favor, revisa tu
              bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <p className="text-xs text-gray-500">
              Si no encuentras el correo, revisa tu carpeta de spam o correo no
              deseado.
            </p>
          </div>

          <div className="pt-4">
            <Button onClick={handleVerificationModalClose} className="w-full">
              Entendido, ir a iniciar sesión
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
