export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}) {
  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`
        w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        outline-none transition-colors
        ${className}
      `}
        {...props}
      />
    </>
  );
}
