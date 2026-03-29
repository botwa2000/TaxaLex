'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Catches errors in the root layout — must include <html> and <body>
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-lg font-bold mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-sm text-gray-500 mb-6">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder
            kontaktieren Sie den Support.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono mb-4">
              Fehler-ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
