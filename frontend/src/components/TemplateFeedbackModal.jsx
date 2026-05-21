import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

var TEMPLATE_LABELS = {
  modern: "Монгол хэв маяг",
  classic: "Ази хэв маяг",
  minimal: "Европ хэв маяг",
  "United States": "🇺🇸 АНУ тэтгэлгийн CV",
  "Australia": "🇦🇺 Австрали тэтгэлгийн CV",
  "Japan": "🇯🇵 Япон тэтгэлгийн CV",
};

var STAR_LABELS = ["", "Муу", "Дунд", "Сайн", "Маш сайн", "Гайхалтай"];

function StarPicker({ value, onChange }) {
  var [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(function (n) {
        var filled = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={function () { setHovered(n); }}
            onMouseLeave={function () { setHovered(0); }}
            onClick={function () { onChange(n); }}
            className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
            style={{ color: filled ? "#f59e0b" : "#d1d5db" }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function TemplateFeedbackModal({ templateType, onClose }) {
  var [rating, setRating] = useState(0);
  var [pros, setPros] = useState("");
  var [cons, setCons] = useState("");
  var [submitting, setSubmitting] = useState(false);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    API.get("/feedback/cv-template/my", { params: { template_type: templateType } })
      .then(function (res) {
        if (res.data) {
          setRating(res.data.rating || 0);
          setPros(res.data.pros || "");
          setCons(res.data.cons || "");
        }
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, [templateType]);

  async function handleSubmit() {
    if (!rating) { toast.error("Одоор үнэлгээ өгнө үү"); return; }
    setSubmitting(true);
    try {
      await API.post("/feedback/cv-template", { template_type: templateType, rating, pros, cons });
      toast.success("Үнэлгээ амжилттай хадгалагдлаа!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={function (e) { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider">Загварын үнэлгээ</p>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              {TEMPLATE_LABELS[templateType] || templateType}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 text-lg transition"
          >✕</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ерөнхий үнэлгээ</p>
              <StarPicker value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-sm text-amber-500 font-semibold mt-1">{STAR_LABELS[rating]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Сайн тал
                <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
              </label>
              <textarea
                rows={3}
                value={pros}
                onChange={function (e) { setPros(e.target.value); }}
                placeholder="Жишээ нь: Загвар нь цэвэр, унших хялбар, мэргэжлийн харагддаг..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Сайжруулах тал
                <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
              </label>
              <textarea
                rows={3}
                value={cons}
                onChange={function (e) { setCons(e.target.value); }}
                placeholder="Жишээ нь: Фонт жаахан жижиг байсан, зургийн талбай дутуу мэт санагдсан..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Болих
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !rating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Хадгалах
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
