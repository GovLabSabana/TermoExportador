"use client";

import React, { useState, useEffect } from "react";

export default function Thermometer() {
  // Nivel actual de capacidad para exportar (1 a 5)
  // reemplaza este valor con el que llegue de la API
  const [nivel, setNivel] = useState(3);

  // Colores de cada nivel (del rojo al verde)
  const colores = ["#e53935", "#fb8c00", "#fdd835", "#7cb342", "#388e3c"];

  // Texto descriptivo por nivel
  const etiquetas = [
    "Muy baja capacidad",
    "Baja capacidad",
    "Capacidad media",
    "Buena capacidad",
    "Excelente capacidad",
  ];

  // Simulación de cambio de nivel (ejemplo para pruebas)
  useEffect(() => {
    const timer = setInterval(() => {
      setNivel((prev) => (prev < 5 ? prev + 1 : 1));
    }, 3000); // cambia cada 3 segundos
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Termómetro de Capacidad Exportadora
      </h1>

      {/* Contenedor del termómetro */}
      <div className="relative w-12 h-64 rounded-full border-4 border-gray-300 overflow-hidden">
        {/* Fondo gris */}
        <div className="absolute inset-0 bg-gray-200"></div>

        {/* Nivel coloreado */}
        <div
          className="absolute bottom-0 w-full transition-all duration-700"
          style={{
            height: `${(nivel / 5) * 100}%`,
            backgroundColor: colores[nivel - 1],
          }}
        ></div>
      </div>

      {/* Texto descriptivo */}
      <p className="mt-4 text-lg font-semibold" style={{ color: colores[nivel - 1] }}>
        {etiquetas[nivel - 1]}
      </p>
    </div>
  );
}
