export default function Select({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  required = false,
  className = "",
  ...props 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`
        w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        outline-none transition-colors bg-white
        ${className}
      `}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}