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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to={backLink} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center rounded-xl shadow-sm">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to={backLink} className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition">← {backLabel}</Link>
        </div>
      </nav>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-400/15 to-indigo-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-gray-500 dark:text-gray-500">
          <Link to={backLink} className="hover:text-violet-600 dark:hover:text-violet-400 transition">{backLabel}</Link>
          <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Үйлчилгээний нөхцөл</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:sticky lg:top-24">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3">Гарчиг</p>
              <ul className="space-y-0.5">
                {sections.map(function (s) {
                  return (
                    <li key={s.id}>
                      <a href={"#section-" + s.id} className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-2.5 py-1.5 rounded-lg transition">
                        <span className="text-violet-400 font-semibold mr-1.5">{s.id}.</span>{s.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="lg:col-span-3">
            <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Хууль эрх зүй</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Үйлчилгээний нөхцөл</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Сүүлд шинэчлэгдсэн: 2026 оны 4 сарын 15</p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="p-8 space-y-8">

                <section id="section-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    Үйлчилгээний тухай
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    CareerPrep нь залуучуудын ажилд орох бэлтгэлийг дэмжих зорилготой веб платформ юм. Платформ нь CV үүсгэх, ярилцлагын бэлтгэл хийх, тэтгэлгийн мэдээлэл авах, карьерын зөвлөмж авах зэрэг үйлчилгээг үнэ төлбөргүй үзүүлнэ.
                  </p>
                </section>

                <section id="section-2" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    Бүртгэл
                  </h2>
                  <ul className="space-y-2">
                    {[
                      "Хэрэглэгч үнэн зөв мэдээлэл оруулж бүртгүүлэх үүрэгтэй",
                      "Нэг хэрэглэгч нэг бүртгэлтэй байна",
                      "Бүртгэлийн мэдээлэл, нууц үгийн аюулгүй байдлыг хэрэглэгч өөрөө хариуцна",
                      "18 нас хүрээгүй хэрэглэгч эцэг эхийн зөвшөөрлөөр бүртгүүлнэ",
                    ].map(function (item, i) {
                      return (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section id="section-3" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
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
                        <div key={i} className="flex items-start gap-2.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-3">
                          <span className="text-violet-500 text-sm flex-shrink-0 mt-0.5">›</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="section-4" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                    Оюуны өмч
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Платформын дизайн, код, агуулга нь CareerPrep-ийн оюуны өмч юм. Хэрэглэгчийн үүсгэсэн CV, оруулсан мэдээлэл нь хэрэглэгчийн өмч хэвээр үлдэнэ.
                  </p>
                </section>

                <section id="section-5" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                    Үйлчилгээний хязгаарлалт
                  </h2>
                  <div className="space-y-2">
                    {[
                      { title: "Ажлын байрны баталгаа", desc: "Платформ нь ажлын байрны баталгаа өгөхгүй." },
                      { title: "Тэтгэлгийн мэдээлэл", desc: "Зөвхөн мэдээллийн зорилготой бөгөөд бүртгүүлэх эцсийн шийдвэрийг хэрэглэгч өөрөө гаргана." },
                      { title: "Ярилцлагын зөвлөмж", desc: "Ерөнхий чанартай бөгөөд амжилтын баталгаа биш." },
                    ].map(function (item, i) {
                      return (
                        <div key={i} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">{item.title}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="section-6" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
                    Бүртгэл цуцлах
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Хэрэглэгч хүссэн үедээ бүртгэлээ устгах боломжтой. Бүртгэл устгагдсан тохиолдолд хэрэглэгчийн бүх мэдээлэл (CV, checklist гэх мэт) 30 хоногийн дараа бүрмөсөн устгагдана.
                  </p>
                </section>

                <section id="section-7" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">7</span>
                    Нөхцөлийн өөрчлөлт
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    CareerPrep нь үйлчилгээний нөхцөлийг хэдийд ч өөрчлөх эрхтэй. Өөрчлөлт хийгдсэн тохиолдолд хэрэглэгчдэд мэдэгдэнэ.
                  </p>
                </section>

                <section id="section-8" className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">8</span>
                    Холбоо барих
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                    Үйлчилгээний нөхцөлтэй холбоотой асуулт байвал доорх хаягаар холбогдоно уу.
                  </p>
                  <a href="mailto:info@careerprep.mn" className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/50 transition">
                    ✉ info@careerprep.mn
                  </a>
                </section>

              </div>
            </div>

            {/* Related */}
            <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Нууцлалын бодлогыг харах</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Бид таны мэдээллийг хэрхэн хамгаалдаг талаар уншина уу.</p>
              </div>
              <Link to="/privacy" className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-violet-300 hover:text-violet-600 dark:hover:text-violet-400 transition whitespace-nowrap">
                Нууцлалын бодлого →
              </Link>
            </div>
          </article>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center rounded-lg">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <p className="text-xs">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="hover:text-white transition">Нууцлал</Link>
            <Link to="/terms" className="text-violet-400 font-medium">Нөхцөл</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
