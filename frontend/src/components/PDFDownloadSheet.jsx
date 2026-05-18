export default function PDFDownloadSheet({ onConfirm, onClose }) {
  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-sm shadow-2xl pb-6"
        onClick={function (e) { e.stopPropagation(); }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <button
          onClick={onConfirm}
          className="w-full px-6 py-4 text-base font-semibold text-gray-900 dark:text-gray-100 text-center border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          PDF файлаар татах
        </button>
        <button
          onClick={onClose}
          className="w-full px-6 py-4 text-base font-semibold text-red-500 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Хаах
        </button>
      </div>
    </div>
  );
}
