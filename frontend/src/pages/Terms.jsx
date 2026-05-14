import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Terms() {
  var { token } = useAuth();
  var backLink = token ? "/dashboard" : "/";
  var backLabel = token ? "Dashboard" : "Нүүр";

  var sections = [
    { id: "1", title: "Үйлчилгээний тухай" },
    { id: "2", title: "Бүртгэл" },
    { id: "3", title: "Хэрэглэгчийн үүрэг" },
    { id: "4", title: "Оюуны өмч" },
    { id: "5", title: "Үйлчилгээний хязгаарлалт" },
    { id: "6", title: "Бүртгэл цуцлах" },
    { id: "7", title: "Нөхцөлийн өөрчлөлт" },
    { id: "8", title: "Холбоо барих" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to={backLink} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <Link to={backLink} className="text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 font-medium">← {backLabel}</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500 dark:text-gray-500">
          <Link to={backLink} className="hover:text-slate-900 dark:hover:text-gray-300">{backLabel}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-gray-300 font-medium">Үйлчилгээний нөхцөл</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar — table of contents */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded p-5 lg:sticky lg:top-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-3">Гарчиг</p>
              <ul className="space-y-1">
                {sections.map(function (s) {
                  return (
                    <li key={s.id}>
                      <a href={"#section-" + s.id} className="block text-sm text-slate-600 dark:text-gray-400 hover:text-[#1e3a8a] hover:bg-slate-50 dark:hover:bg-gray-700 px-2 py-1.5 rounded transition">
                        {s.id}. {s.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="lg:col-span-3">
            <div className="mb-8 pb-6 border-b border-slate-200 dark:border-gray-700">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Хууль эрх зүй</p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100">Үйлчилгээний нөхцөл</h1>
              <p className="text-sm text-slate-500 dark:text-gray-500 mt-2">Сүүлд шинэчлэгдсэн: 2026 оны 4 сарын 15</p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded">
              <div className="p-8 space-y-8">

                <section id="section-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">1</span>
                    Үйлчилгээний тухай
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    CareerPrep нь залуучуудын ажилд орох бэлтгэлийг дэмжих зорилготой веб платформ юм. Платформ нь CV үүсгэх, ярилцлагын бэлтгэл хийх, тэтгэлгийн мэдээлэл авах, карьерын зөвлөмж авах зэрэг үйлчилгээг үнэ төлбөргүй үзүүлнэ.
                  </p>
                </section>

                <section id="section-2" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">2</span>
                    Бүртгэл
                  </h2>
                  <ul className="space-y-1.5">
                    {[
                      "Хэрэглэгч үнэн зөв мэдээлэл оруулж бүртгүүлэх үүрэгтэй",
                      "Нэг хэрэглэгч нэг бүртгэлтэй байна",
                      "Бүртгэлийн мэдээлэл, нууц үгийн аюулгүй байдлыг хэрэглэгч өөрөө хариуцна",
                      "18 нас хүрээгүй хэрэглэгч эцэг эхийн зөвшөөрлөөр бүртгүүлнэ",
                    ].map(function (item, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-gray-300">
                          <span className="text-[#1e3a8a] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section id="section-3" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">3</span>
                    Хэрэглэгчийн үүрэг
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Платформыг зөвхөн хууль ёсны зорилгоор ашиглах",
                      "Бусдын мэдээллийг зөвшөөрөлгүй ашиглахгүй байх",
                      "Хортой програм, спам тараахгүй байх",
                      "Системийн аюулгүй байдалд халдахгүй байх",
                    ].map(function (item, i) {
                      return (
                        <div key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded p-2.5">
                          <span className="text-[#1e3a8a] text-sm flex-shrink-0">›</span>
                          <span className="text-xs text-slate-700 dark:text-gray-300">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="section-4" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">4</span>
                    Оюуны өмч
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    Платформын дизайн, код, агуулга нь CareerPrep-ийн оюуны өмч юм. Хэрэглэгчийн үүсгэсэн CV, оруулсан мэдээлэл нь хэрэглэгчийн өмч хэвээр үлдэнэ.
                  </p>
                </section>

                <section id="section-5" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">5</span>
                    Үйлчилгээний хязгаарлалт
                  </h2>
                  <div className="space-y-2">
                    {[
                      { title: "Ажлын байрны баталгаа", desc: "Платформ нь ажлын байрны баталгаа өгөхгүй." },
                      { title: "Тэтгэлгийн мэдээлэл", desc: "Зөвхөн мэдээллийн зорилготой бөгөөд бүртгүүлэх эцсийн шийдвэрийг хэрэглэгч өөрөө гаргана." },
                      { title: "Ярилцлагын зөвлөмж", desc: "Ерөнхий чанартай бөгөөд амжилтын баталгаа биш." },
                    ].map(function (item, i) {
                      return (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded p-3">
                          <p className="text-sm font-semibold text-amber-900">{item.title}</p>
                          <p className="text-xs text-amber-800 mt-1">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="section-6" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">6</span>
                    Бүртгэл цуцлах
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    Хэрэглэгч хүссэн үедээ бүртгэлээ устгах боломжтой. Бүртгэл устгагдсан тохиолдолд хэрэглэгчийн бүх мэдээлэл (CV, checklist гэх мэт) 30 хоногийн дараа бүрмөсөн устгагдана.
                  </p>
                </section>

                <section id="section-7" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">7</span>
                    Нөхцөлийн өөрчлөлт
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    CareerPrep нь үйлчилгээний нөхцөлийг хэдийд ч өөрчлөх эрхтэй. Өөрчлөлт хийгдсэн тохиолдолд хэрэглэгчдэд мэдэгдэнэ.
                  </p>
                </section>

                <section id="section-8" className="pt-6 border-t border-slate-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">8</span>
                    Холбоо барих
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Үйлчилгээний нөхцөлтэй холбоотой асуулт байвал доорх хаягаар холбогдоно уу.
                  </p>
                  <a href="mailto:info@careerprep.mn" className="inline-flex items-center gap-2 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] px-4 py-2 rounded text-sm font-semibold hover:bg-[#1e3a8a]/10 transition">
                    <span>✉</span> info@careerprep.mn
                  </a>
                </section>

              </div>
            </div>

            {/* Related links */}
            <div className="mt-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">Нууцлалын бодлогыг харах</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">Бид таны мэдээллийг хэрхэн хамгаалдаг талаар уншина уу.</p>
              </div>
              <Link to="/privacy" className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded text-sm font-semibold hover:bg-slate-50 dark:hover:bg-gray-700 transition whitespace-nowrap">
                Нууцлалын бодлого →
              </Link>
            </div>
          </article>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-gray-500">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-4 text-xs text-slate-500 dark:text-gray-500">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-gray-300">Нууцлал</Link>
            <Link to="/terms" className="text-[#1e3a8a] font-medium">Нөхцөл</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}