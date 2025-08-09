"use client";

import { useEffect, useRef } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  closeOnOverlayClick = true,
}) {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    xlarge: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 "
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      {/* Contenedor del modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl transform transition-all w-full ${sizeClasses[size]} z-10`}
      >
        {title && (
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Contenido dinámico */}
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
