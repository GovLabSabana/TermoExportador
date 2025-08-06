export default function Textarea({ 
  placeholder, 
  value, 
  onChange, 
  required = false,
  rows = 4,
  className = "",
  ...props 
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      className={`
        w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        outline-none transition-colors resize-vertical
        ${className}
      `}
      {...props}
    />
  )
}