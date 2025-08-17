"use client";

import { useState } from "react";

export default function Form() {
  const preguntas = [
    "1. ¿Cuenta su empresa con Buenas Prácticas Agrícolas BPA?",
    "2. ¿Cuenta su empresa con certificaciones internacionales?",
    "3. ¿La empresa exporta actualmente?",
    "4. ¿Dispone la empresa de personal capacitado en comercio exterior y normativas internacionales?",
    "5. ¿Cuenta la empresa con un sistema de gestión de calidad estandarizado para exportación?",
    "6. ¿Dispone la empresa de una cadena logística optimizada para entregas internacionales dentro de plazos competitivos (e.g., 2-4 días)?",
    "7. ¿Ha establecido la empresa alianzas con distribuidores o agentes para mercados internacionales?",
    "8. ¿Cuenta su empresa con una estrategia de costos y precios a nivel internacional?",
    "9. ¿Ha implementado la empresa un plan de distribución internacional que incluya socios y rutas optimizadas?",
    "10. ¿Tiene procedimientos claros y documentados para atender reclamos y devoluciones internacionales de forma rápida y efectiva?",
    "11. ¿Dispone la empresa de financiamiento o líneas de crédito para proyectos de internacionalización?",
    "12. ¿Ha desarrollado la empresa una estrategia digital (e.g., sitio web multilingüe, SEO) para promocionarse en mercados internacionales?",
    "13. ¿Cuenta la empresa con un plan de internacionalización que incluya análisis de mercado y estrategias de entrada?",
    "14. ¿Ha identificado la empresa los requisitos legales y fiscales de los mercados internacionales?",
    "15. ¿Ha realizado la empresa un análisis de riesgos para su estrategia de internacionalización?",
    "16. ¿Ha participado en eventos internacionales como ferias, ruedas de negocios o encuentros empresariales en el último año?"
  ];

  const totalPreguntas = preguntas.length; // solo preguntas principales

  const [respuestas, setRespuestas] = useState(Array(preguntas.length).fill(""));
  const [tipoExportacion, setTipoExportacion] = useState("");

  const handleChange = (index, value) => {
    const newRespuestas = [...respuestas];
    newRespuestas[index] = value;
    setRespuestas(newRespuestas);

    if (index === 2 && value !== "Sí") {
      setTipoExportacion(""); // borrar subrespuesta si elige "No"
    }
  };

  // Calcular completadas sin que la subpregunta cuente como pregunta aparte
  const completadas = respuestas.reduce((count, r, i) => {
    if (i === 2) {
      if (r === "No") return count + 1;
      if (r === "Sí" && tipoExportacion) return count + 1;
      return count;
    }
    return r.trim() !== "" ? count + 1 : count;
  }, 0);

  const progreso = Math.round((completadas / totalPreguntas) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Respuestas:", respuestas, "Tipo exportación:", tipoExportacion);
    alert("Respuestas guardadas correctamente");
  };

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Barra de progreso */}
        <div className="sticky top-0 bg-white pb-4 z-10">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm font-medium text-gray-700">{progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-6">Formulario</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                {pregunta}
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    value="Sí"
                    checked={respuestas[index] === "Sí"}
                    onChange={() => handleChange(index, "Sí")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Sí
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    value="No"
                    checked={respuestas[index] === "No"}
                    onChange={() => handleChange(index, "No")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  No
                </label>
              </div>

              {/* Subpregunta solo si "La empresa exporta" es Sí */}
              {index === 2 && respuestas[index] === "Sí" && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-md font-medium text-gray-700 mb-2">
                    ¿Exporta directa o indirectamente?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tipo-exportacion"
                        value="Directa"
                        checked={tipoExportacion === "Directa"}
                        onChange={() => setTipoExportacion("Directa")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Directa
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tipo-exportacion"
                        value="Indirecta"
                        checked={tipoExportacion === "Indirecta"}
                        onChange={() => setTipoExportacion("Indirecta")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Indirecta
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
          >
            Guardar respuesta
          </button>
        </form>
      </div>
    </div>
  );
}
