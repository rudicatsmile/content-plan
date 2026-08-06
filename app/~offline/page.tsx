'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <svg
          className="mx-auto h-24 w-24 text-slate-300 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 10l6 6M15 10l-6 6"
          />
        </svg>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Anda Sedang Offline</h1>
        <p className="text-slate-500 mb-8">
          Aplikasi tidak dapat terhubung ke internet. Silakan periksa koneksi Wi-Fi atau data seluler Anda, lalu coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Coba Muat Ulang
        </button>
      </div>
    </div>
  )
}
