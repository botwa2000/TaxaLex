'use client'

export function PrintButton({ label }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
    >
      {label ?? 'Print / Save as PDF'}
    </button>
  )
}
