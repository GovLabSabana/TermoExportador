"use client";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Header() {
  const { user, logout, isLoading, isAuthenticated, isLoggingOut } =
    useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  // Desktop Navigation Links
  const getNavigationLinks = () => {
    if (isAuthenticated && user) {
      return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/form", label: "Form" },
        { href: "/thermometer", label: "Thermometer" },
        { href: "/survey", label: "Survey" },
      ];
    }
    return [];
  };

  const navigationLinks = getNavigationLinks();

  const renderDesktopNavigation = () => {
    // Show skeleton/loading state during hydration
    if (isLoading) {
      return (
        <div className="hidden md:flex space-x-8 items-center">
          <div className="animate-pulse flex space-x-4 h-8">
            <div className="h-auto w-32 bg-gray-300 rounded"></div>
            <div className="h-auto w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      );
    }

    // Show authenticated navigation
    if (isAuthenticated && user) {
      return (
        <div className="hidden md:flex space-x-6 items-center">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
            <span className="text-sm text-gray-600 hidden lg:block">
              {user.email}
            </span>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
            >
              {isLoggingOut && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span className="hidden sm:inline">
                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </span>
              <span className="sm:hidden">
                {isLoggingOut ? "..." : "Salir"}
              </span>
            </button>
          </div>
        </div>
      );
    }

    // Show unauthenticated navigation
    return (
      <div className="hidden md:flex space-x-4 items-center">
        <Link
          href="/login"
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/register"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Registrarse
        </Link>
      </div>
    );
  };

  const renderMobileNavigation = () => {
    if (isLoading) return null;

    return (
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          {/* Hamburger icon */}
          <svg
            className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {/* Close icon */}
          <svg
            className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
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
    );
  };

  return (
    <header ref={headerRef} className="bg-white shadow-sm border-b h-fit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="hidden sm:inline">TermoExportador</span>
              <span className="sm:hidden">TE</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-4">
            {renderDesktopNavigation()}
            {renderMobileNavigation()}
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {isAuthenticated && user ? (
              <>
                {/* User info */}
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">Usuario autenticado</p>
                </div>

                {/* Navigation links */}
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Logout button */}
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-red-400 disabled:cursor-not-allowed  px-3 py-2 rounded-md text-base font-medium transition-colors mt-4 border-t border-gray-200 pt-4 flex items-center space-x-2"
                >
                  {isLoggingOut && (
                    <svg
                      className="animate-spin h-4 w-4 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="bg-blue-500 hover:bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
