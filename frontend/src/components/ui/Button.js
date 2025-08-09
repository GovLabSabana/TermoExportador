export default function Button({
  children,
  type = "button",
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
  ...props
}) {
  const baseStyles =
    "px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
