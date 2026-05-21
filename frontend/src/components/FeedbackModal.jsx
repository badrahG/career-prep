import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

var CATEGORY_OPTIONS = [
  { value: "general",      label: "Ерөнхий" },
  { value: "cv",           label: "CV Builder" },
  { value: "interview",    label: "Ярилцлагын бэлтгэл" },
  { value: "scholarship",  label: "Тэтгэлэг" },
  { value: "other",        label: "Бусад" },
];

var STAR_LABELS = ["", "Муу", "Дунд", "Сайн", "Маш сайн", "Гайхалтай"];

export default function FeedbackModal({ onClose }) {
  var [rating, setRating] = useState(0);
  var [hoverRating, setHoverRating] = useState(0);
  var [category, setCategory] = useState("general");
  var [message, setMessage] = useState("");
  var [loading, setLoading] = useState(false);
  var [done, setDone] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { toast.error("Үнэлгээ өгнө үү"); return; }
    setLoading(true);
    API.post("/feedback/system", { rating: rating, category: category, message: message })
      .then(function () { setDone(true); })
      .catch(function (err) {
        var detail = err.response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Илгээхэд алдаа гарлаа");
      })
      .finally(function () { setLoading(false); });
  }

  var activeRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={function (e) { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >✕</button>

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🙏</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Баярлалаа!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Таны санал хүсэлт хүлээн авагдлаа. Бид сайжруулахдаа анхаарна.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
            >Хаах</button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Санал хүсэлт</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                CareerPrep системийн талаар үнэлгээ болон санал өгнө үү
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star rating */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ерөнхий сэтгэл ханамж</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(function (s) {
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={function () { setRating(s); }}
                        onMouseEnter={function () { setHoverRating(s); }}
                        onMouseLeave={function () { setHoverRating(0); }}
                        className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                        style={{ color: s <= activeRating ? "#f59e0b" : "#d1d5db" }}
                      >★</button>
                    );
                  })}
                  {activeRating > 0 && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {STAR_LABELS[activeRating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Ямар хэсгийн талаар?
                </label>
                <select
                  value={category}
                  onChange={function (e) { setCategory(e.target.value); }}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                >
                  {CATEGORY_OPTIONS.map(function (opt) {
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                  })}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Санал, зөвлөмж{" "}
                  <span className="text-gray-400 font-normal">(заавал биш)</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={function (e) { setMessage(e.target.value); }}
                  placeholder="Юу сайн байна? Юуг сайжруулах хэрэгтэй вэ?"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-full hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Илгээж байна..." : "Илгээх"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
