'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Log current state
    console.log('Dashboard page state:', {
      isAuthenticated,
      isLoading,
      user: user?.email
    })
  }, [isAuthenticated, isLoading, user])

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                Bienvenido, {user?.email}
              </h2>
              <p className="text-gray-600">
                Has iniciado sesión correctamente. Esta es una página protegida que solo pueden ver usuarios autenticados.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de Usuario
              </h3>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID de Usuario</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Session Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {isAuthenticated ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado de Auth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Preguntas Básicas
              </h3>

              <div className="space-y-4">
                {[
                  'Nombre de la compañía',
                  'Nombre de quien responde la encuesta',
                  'Email',
                  'Teléfono del contacto',
                  'NIT',
                  'Ciudad',
                  '¿Cómo definiría el tamaño de su empresa?'
                ].map((label, idx, arr) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      {idx === arr.length - 1 && (
                        <a
                          href="https://www.mipymes.gov.co/temas-de-interes/definicion-tamano-empresarial-micro-pequena-median"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          ¿No está seguro?
                        </a>
                      )}
                    </div>

                    {idx === arr.length - 1 ? (
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="microempresa">Microempresa</option>
                        <option value="pequena">Empresa pequeña</option>
                        <option value="mediana">Empresa mediana</option>
                        <option value="grande">Empresa grande</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => console.log('Guardar respuestas')}
                  variant="primary"
                  className="w-full"
                >
                  Guardar Respuestas
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}