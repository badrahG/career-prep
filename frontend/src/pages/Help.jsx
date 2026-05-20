import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

var FAQS = [
  {
    q: "CV хэрхэн үүсгэх вэ?",
    a: "CV цэс → \"CV үүсгэх\" товч → Загвар сонгох → Мэдээллээ алхам алхмаар оруулах → Хадгалах. Бэлэн CV байршуулж автоматаар уншуулах боломжтой.",
  },
  {
    q: "PDF татах хэрхэн вэ?",
    a: "CV дэлгэрэнгүй хуудаснаас \"⬇ PDF татах\" дарна. Desktop дээр шууд хэвлэх цонх нээгдэнэ. Mobile дээр \"PDF файлаар татах\" товч дарна.",
  },
  {
    q: "Англи болон Япон орчуулга хэрхэн ажилладаг вэ?",
    a: "CV дэлгэрэнгүй хуудаснаас \"🌐 Англи орчуулга\" эсвэл \"🇯🇵 Япон орчуулга\" дарна. DeepL AI ашиглан орчуулж урьдчилан харуулах цонх нээнэ. Тэндээс PDF татаж болно.",
  },
  {
    q: "Тэтгэлгийн CV гэж юу вэ?",
    a: "АНУ, Австрали, Японд тэтгэлэгт өргөдөл гаргахад зориулсан тусгай загварын CV. Хувийн мэдээлэл, боловсрол, амжилт, leadership, зорилго зэргийг нарийвчлан бөглөнө.",
  },
  {
    q: "Ярилцлагын бэлтгэл хэрхэн хийх вэ?",
    a: "\"Ярилцлага\" цэснээс Flashcard (асуулт-хариулт цээжлэх), Quiz (тест), STAR аргын дасгал гэсэн гурван горимоос сонгон бэлтгэл хийнэ.",
  },
  {
    q: "CV Анализ гэж юу хийдэг вэ?",
    a: "CV-ийнхэ текстийг буулгаж ажлын байрны тодорхойлолттой харьцуулна. AI дүн шинжилгээ хийж тохирох байдал, сайжруулах зөвлөмж өгнө.",
  },
  {
    q: "Загварын үнэлгээ хэрхэн өгөх вэ?",
    a: "CV дэлгэрэнгүй хуудаснаас \"★ Үнэлгээ өгөх\" товч дарж 1-5 одоор үнэлэнэ. Сайн тал болон сайжруулах талыг бичих боломжтой.",
  },
  {
    q: "Нэвтрэх нууц үгээ мартсан бол яах вэ?",
    a: "Нэвтрэх хуудаснаас \"Нууц үг мартсан\" дарна. Бүртгэлтэй имэйл хаяг руу нууц үг сэргээх линк илгээнэ.",
  },
];

var FEATURES = [
  {
    icon: "📄",
    title: "CV Builder",
    desc: "Монгол, Ази, Европ гэсэн 3 загвараар мэргэжлийн CV үүсгэнэ. PDF татах, Англи/Япон орчуулга, загварын үнэлгээ.",
    to: "/cv/start",
    cta: "CV үүсгэх",
  },
  {
    icon: "🎓",
    title: "Scholarship CV",
    desc: "АНУ, Австрали, Японд тэтгэлэгт өргөдөл гаргах CV болон motivation letter. Англи/Япон орчуулгатай.",
    to: "/cv/scholarship/new",
    cta: "Тэтгэлгийн CV",
  },
  {
    icon: "🎯",
    title: "Ярилцлагын бэлтгэл",
    desc: "Flashcard, Quiz, STAR арга гэсэн 3 горимоор ярилцлагад бэлдэнэ. Ерөнхий, техникийн, зан үйлийн асуултууд.",
    to: "/interview",
    cta: "Бэлтгэл эхлэх",
  },
  {
    icon: "💡",
    title: "Карьерын зөвлөмж",
    desc: "CV, ярилцлага, ажил хайлт, карьер зэрэг сэдвээр мэргэжилтнүүдийн нийтлэл, видео зааварчилгаа.",
    to: "/advice",
    cta: "Зөвлөмж үзэх",
  },
  {
    icon: "🏫",
    title: "Тэтгэлгийн жагсаалт",
    desc: "Гадаад болон дотоодын тэтгэлгүүдийн мэдээлэл. Хугацаа, шаардлага, холбоосыг нэг газраас харна.",
    to: "/scholarship",
    cta: "Тэтгэлэг хайх",
  },
  {
    icon: "🔍",
    title: "CV Анализ",
    desc: "CV болон ажлын байрны тодорхойлолтыг AI-аар харьцуулж тохирох байдал, дутуу ур чадварыг олж тогтооно.",
    to: "/cv-analysis",
    cta: "Анализ хийх",
  },
];

var VIDEOS = [
  { title: "CV хэрхэн үүсгэх — алхам алхмаар", duration: "5:30", thumb: null },
  { title: "Тэтгэлгийн CV бөглөх заавар", duration: "8:10", thumb: null },
  { title: "Ярилцлагын бэлтгэл — STAR арга", duration: "6:45", thumb: null },
];

function FAQItem({ q, a }) {
  var [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <button
        onClick={function () { setOpen(!open); }}
        className="w-full flex items-center justify-between text-left py-4 gap-4"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{q}</span>
        <span className={"flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform " +
          (open ? "rotate-180 bg-violet-100 dark:bg-violet-900/30" : "bg-gray-100 dark:bg-gray-700")}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke={open ? "#7c3aed" : "#6b7280"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-600 dark:text-gray-300 pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function Help() {
  var [contactName, setContactName] = useState("");
  var [contactMsg, setContactMsg] = useState("");

  function handleContact(e) {
    e.preventDefault();
    var subject = encodeURIComponent("CareerPrep тусламж" + (contactName ? " — " + contactName : ""));
    var body = encodeURIComponent(contactMsg);
    window.location.href = "mailto:g.badrakh98@gmail.com?subject=" + subject + "&body=" + body;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div>
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Тусламж</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Яаж ашиглах вэ?</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">CareerPrep-ийн функцуудыг хэрхэн ашиглах заавар болон түгээмэл асуулт хариулт.</p>
        </div>

        {/* Features */}
        <section>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Онцлог функцүүд</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(function (f) {
              return (
                <div key={f.title} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{f.icon}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{f.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{f.desc}</p>
                  <Link
                    to={f.to}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline mt-1"
                  >
                    {f.cta} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2">Түгээмэл асуулт хариулт</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5">
            {FAQS.map(function (item) {
              return <FAQItem key={item.q} q={item.q} a={item.a} />;
            })}
          </div>
        </section>

        {/* Video tutorials */}
        <section>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Видео зааварчилгаа</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VIDEOS.map(function (v) {
              return (
                <div key={v.title} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 h-28 flex items-center justify-center">
                    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#7c3aed" opacity={0.15} />
                      <path d="M16 13l14 7-14 7V13z" fill="#7c3aed" />
                    </svg>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug">{v.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{v.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">Видео зааварчилгаанууд тун удахгүй нэмэгдэнэ.</p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Холбоо барих</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Асуулт, санал хүсэлт байвал доорх хаягаар холбогдоорой. 24 цагийн дотор хариу өгнө.
            </p>
            <form onSubmit={handleContact} className="space-y-3">
              <input
                type="text"
                value={contactName}
                onChange={function (e) { setContactName(e.target.value); }}
                placeholder="Таны нэр (заавал биш)"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              />
              <textarea
                rows={4}
                value={contactMsg}
                onChange={function (e) { setContactMsg(e.target.value); }}
                placeholder="Асуулт эсвэл санал хүсэлтээ бичнэ үү..."
                required
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
              />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  📧 g.badrakh98@gmail.com
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-md transition"
                >
                  Илгээх
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </Layout>
  );
}
