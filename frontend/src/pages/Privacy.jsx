import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Privacy() {
  var { token } = useAuth();
  var backLink = token ? "/dashboard" : "/";
  var backLabel = token ? "Dashboard" : "Нүүр";

  var sections = [
    { id: "1", title: "Ерөнхий мэдээлэл" },
    { id: "2", title: "Цуглуулах мэдээлэл" },
    { id: "3", title: "Мэдээлэл ашиглах зорилго" },
    { id: "4", title: "Мэдээллийн хамгаалалт" },
    { id: "5", title: "Гуравдагч талд мэдээлэл дамжуулах" },
    { id: "6", title: "Хэрэглэгчийн эрх" },
    { id: "7", title: "Холбоо барих" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to={backLink} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <Link to={backLink} className="text-sm text-slate-600 hover:text-slate-900 font-medium">← {backLabel}</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to={backLink} className="hover:text-slate-900">{backLabel}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Нууцлалын бодлого</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar — table of contents */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded p-5 lg:sticky lg:top-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Гарчиг</p>
              <ul className="space-y-1">
                {sections.map(function (s) {
                  return (
                    <li key={s.id}>
                      <a href={"#section-" + s.id} className="block text-sm text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50 px-2 py-1.5 rounded transition">
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
            <div className="mb-8 pb-6 border-b border-slate-200">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Хууль эрх зүй</p>
              <h1 className="text-3xl font-bold text-slate-900">Нууцлалын бодлого</h1>
              <p className="text-sm text-slate-500 mt-2">Сүүлд шинэчлэгдсэн: 2026 оны 4 сарын 15</p>
            </div>

            <div className="bg-white border border-slate-200 rounded">
              <div className="p-8 space-y-8">

                <section id="section-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">1</span>
                    Ерөнхий мэдээлэл
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    CareerPrep платформ нь хэрэглэгчдийн хувийн мэдээллийг хамгаалахад онцгой анхаарал хандуулдаг. Энэхүү нууцлалын бодлого нь бидний цуглуулж, ашиглаж, хадгалж буй мэдээллийн төрөл, зорилго, хамгаалалтын арга хэмжээг тодорхойлно.
                  </p>
                </section>

                <section id="section-2" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">2</span>
                    Цуглуулах мэдээлэл
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">Бид дараах мэдээллийг цуглуулна:</p>
                  <ul className="space-y-2">
                    {[
                      { title: "Бүртгэлийн мэдээлэл", desc: "овог, нэр, и-мэйл хаяг, утасны дугаар" },
                      { title: "CV мэдээлэл", desc: "боловсрол, ажлын туршлага, ур чадвар" },
                      { title: "Платформ ашиглалт", desc: "нэвтрэлтийн түүх, үйлдлийн лог" },
                    ].map(function (item, i) {
                      return (
                        <li key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded p-3">
                          <span className="text-[#1e3a8a] font-bold text-sm flex-shrink-0">›</span>
                          <div>
                            <span className="text-sm font-semibold text-slate-900">{item.title}: </span>
                            <span className="text-sm text-slate-600">{item.desc}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section id="section-3" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">3</span>
                    Мэдээлэл ашиглах зорилго
                  </h2>
                  <ul className="space-y-1.5">
                    {[
                      "Хэрэглэгчийн бүртгэл, нэвтрэлтийг удирдах",
                      "CV үүсгэх, хадгалах үйлчилгээ үзүүлэх",
                      "Ярилцлагын бэлтгэл, тэтгэлгийн мэдээлэл хүргэх",
                      "Платформын аюулгүй байдлыг хангах",
                      "Үйлчилгээг сайжруулах зорилгоор статистик дүн шинжилгээ хийх",
                    ].map(function (item, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-[#1e3a8a] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section id="section-4" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">4</span>
                    Мэдээллийн хамгаалалт
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Бид хэрэглэгчдийн мэдээллийг хамгаалахын тулд дараах арга хэмжээг авч хэрэгжүүлнэ:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Нууц үгийг bcrypt алгоритмаар хэшлэж хадгалах",
                      "HTTPS протоколоор өгөгдлийг шифрлэж дамжуулах",
                      "JWT token ашиглан сессийг аюулгүй удирдах",
                      "Өгөгдлийн сангийн нөөцөлтийг өдөр бүр хийх",
                      "SQL injection, XSS довтолгооноос хамгаалах",
                    ].map(function (item, i) {
                      return (
                        <div key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded p-2.5">
                          <span className="text-emerald-700 text-sm flex-shrink-0">✓</span>
                          <span className="text-xs text-slate-700">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="section-5" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">5</span>
                    Гуравдагч талд мэдээлэл дамжуулах
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Бид хэрэглэгчийн хувийн мэдээллийг гуравдагч талд зөвшөөрөлгүйгээр дамжуулахгүй. Зөвхөн хуулийн шаардлагаар эсвэл хэрэглэгчийн зөвшөөрлөөр дамжуулж болно.
                  </p>
                </section>

                <section id="section-6" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">6</span>
                    Хэрэглэгчийн эрх
                  </h2>
                  <ul className="space-y-1.5">
                    {[
                      "Өөрийн мэдээллийг харах, засварлах эрхтэй",
                      "Бүртгэлээ устгах хүсэлт гаргах эрхтэй",
                      "Мэдээлэл цуглуулахаас татгалзах эрхтэй",
                    ].map(function (item, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-[#1e3a8a] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section id="section-7" className="pt-6 border-t border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 w-7 h-7 rounded flex items-center justify-center font-bold">7</span>
                    Холбоо барих
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Нууцлалын бодлоготой холбоотой асуулт, хүсэлт байвал доорх хаягаар холбогдоно уу.
                  </p>
                  <a href="mailto:info@careerprep.mn" className="inline-flex items-center gap-2 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] px-4 py-2 rounded text-sm font-semibold hover:bg-[#1e3a8a]/10 transition">
                    <span>✉</span> info@careerprep.mn
                  </a>
                </section>

              </div>
            </div>

            {/* Related links */}
            <div className="mt-6 bg-white border border-slate-200 rounded p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Үйлчилгээний нөхцөлийг харах</p>
                <p className="text-xs text-slate-500 mt-0.5">Платформын үйлчилгээний нөхцөлүүдийг танилцана уу.</p>
              </div>
              <Link to="/terms" className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 transition whitespace-nowrap">
                Үйлчилгээний нөхцөл →
              </Link>
            </div>
          </article>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="text-[#1e3a8a] font-medium">Нууцлал</Link>
            <Link to="/terms" className="hover:text-slate-900">Нөхцөл</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}