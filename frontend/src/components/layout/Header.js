import Link from 'next/link'

export default function Header() {
  const isLoggedIn = false

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">
              TermoExportador
            </span>
          </div>

          <nav className="flex space-x-8 items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/form"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Form
                </Link>
                <Link
                  href="/thermometer"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Thermometer
                </Link>
                <Link
                  href="/"
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
                {/* {<Link 
                  href="/survey" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Survey
                </Link>} */}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}