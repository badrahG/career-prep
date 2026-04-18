import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  var { token, user } = useAuth();

  var features = [
    {
      icon: "CV",
      title: "CV үүсгэх",
      desc: "3 загвартай, алхам алхмаар дагадаг форм. PDF татаж авна.",
      link: "/cv",
      color: "bg-blue-600",
    },
    {
      icon: "IV",
      title: "Ярилцлагын бэлтгэл",
      desc: "25+ асуулт, 3 горим: Flashcard, Quiz, STAR дадлага.",
      link: "/interview",
      color: "bg-purple-600",
    },
    {
      icon: "AD",
      title: "Карьерын зөвлөмж",
      desc: "CV бичих, ярилцлага, ажил олох, карьер ургуулах 16+ зөвлөмж.",
      link: "/advice",
      color: "bg-emerald-600",
    },
    {
      icon: "SH",
      title: "Тэтгэлэг & Internship",
      desc: "Дотоодын тэтгэлэг, дадлагын хөтөлбөрүүд нэг газар.",
      link: "/scholarship",
      color: "bg-amber-600",
    },
  ];

  var templates = [
    {
      name: "Modern",
      tagline: "Орчин үеийн, минималист",
      desc: "Хурц навy өнгөтэй, IT болон дизайны салбарт тохиромжтой.",
      preview: "modern",
    },
    {
      name: "Classic",
      tagline: "Сонгодог, албан ёсны",
      desc: "Санхүү, эрх зүй, боловсролын салбарт тохиромжтой загвар.",
      preview: "classic",
    },
    {
      name: "Minimal",
      tagline: "Энгийн, цэвэрхэн",
      desc: "Бүх салбарт тохиромжтой, агуулга дээр анхаардаг загвар.",
      preview: "minimal",
    },
  ];

  var steps = [
    { num: 1, title: "Бүртгүүлэх", desc: "Бүртгэлтэй бол шууд нэвтэрч, үгүй бол 1 минутад бүртгүүлнэ." },
    { num: 2, title: "Профайл үүсгэх", desc: "Боловсрол, туршлага, ур чадвараа оруулна." },
    { num: 3, title: "CV үүсгэх, дадлага хийх", desc: "CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлэг хайх." },
    { num: 4, title: "Ажилд орох", desc: "Бэлэн болсныхоо дараа итгэлтэйгээр ярилцлагад орж чадна." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top banner */}
      <div className="bg-[#1e3a8a] text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <span>Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ</span>
          <span className="hidden md:block opacity-80">info@careerprep.mn</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-none">CareerPrep</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium">Боломжууд</a>
            <a href="#templates" className="text-slate-600 hover:text-slate-900 font-medium">CV Загвар</a>
            <a href="#how" className="text-slate-600 hover:text-slate-900 font-medium">Хэрхэн ажилладаг</a>
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <Link to="/dashboard" className="bg-[#1e3a8a] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden md:inline-block px-4 py-2 text-slate-700 hover:text-slate-900 text-sm font-medium">Нэвтрэх</Link>
                <Link to="/register" className="bg-[#1e3a8a] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                  Эхлэх →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] px-3 py-1.5 rounded text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full"></span>
                Залуучуудад зориулсан платформ
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-5">
                Ажилдаа бэлэн бол,<br />
                <span className="text-[#1e3a8a]">амжилтанд ойрхон</span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлгийн мэдээлэл авах бүх зүйлсийг нэг газраас. Үнэгүй ашиглаарай.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {token ? (
                  <Link to="/dashboard" className="bg-[#1e3a8a] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1e40af] transition inline-flex items-center gap-2">
                    Dashboard руу орох →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="bg-[#1e3a8a] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1e40af] transition inline-flex items-center gap-2">
                      Үнэгүй эхлэх →
                    </Link>
                    <a href="#features" className="border border-slate-300 text-slate-700 px-6 py-3 rounded text-sm font-semibold hover:bg-slate-50 transition">
                      Дэлгэрэнгүй үзэх
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Үнэгүй</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Монгол хэлээр</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>1 минутад эхлэнэ</span>
                </div>
              </div>
            </div>

            {/* Right: decorative CV mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Background CV */}
                <div className="absolute top-8 right-8 bg-white border border-slate-200 rounded shadow-sm w-72 opacity-40 transform rotate-3">
                  <div className="h-2 bg-slate-400 rounded-t"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                  </div>
                </div>

                {/* Main CV mockup */}
                <div className="relative bg-white border border-slate-200 rounded shadow-lg w-80 mx-auto transform -rotate-1 hover:rotate-0 transition duration-500">
                  <div className="h-2 bg-[#1e3a8a] rounded-t"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-400 text-xs">PHOTO</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-800 rounded w-32 mb-1.5"></div>
                        <div className="h-2 bg-slate-300 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="h-2 bg-[#1e3a8a] rounded w-16 mb-2"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-full mb-1"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-4/5"></div>
                      </div>
                      <div>
                        <div className="h-2 bg-[#1e3a8a] rounded w-20 mb-2"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-full mb-1"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-3/4 mb-1"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-5/6"></div>
                      </div>
                      <div>
                        <div className="h-2 bg-[#1e3a8a] rounded w-14 mb-2"></div>
                        <div className="flex flex-wrap gap-1">
                          <div className="h-4 bg-slate-100 rounded px-2 w-12"></div>
                          <div className="h-4 bg-slate-100 rounded px-2 w-10"></div>
                          <div className="h-4 bg-slate-100 rounded px-2 w-14"></div>
                          <div className="h-4 bg-slate-100 rounded px-2 w-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 pt-16 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "3", label: "CV загвар" },
              { value: "25+", label: "Ярилцлагын асуулт" },
              { value: "16+", label: "Карьерын зөвлөмж" },
              { value: "100%", label: "Үнэгүй" },
            ].map(function (s, i) {
              return (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#1e3a8a]">{s.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mt-2">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Боломжууд</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Бүх шаардлагатай зүйл нэг газар</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Ажлын хайлтын бүх шатанд танд тус болох 4 гол модуль.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(function (f, i) {
              return (
                <Link key={i} to={f.link} className="bg-white border border-slate-200 rounded p-6 hover:border-[#1e3a8a] hover:shadow-sm transition group">
                  <div className={"w-12 h-12 rounded flex items-center justify-center mb-4 " + f.color}>
                    <span className="text-white font-bold text-sm">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#1e3a8a] transition">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs text-[#1e3a8a] font-semibold opacity-0 group-hover:opacity-100 transition">
                    Үзэх →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CV Templates preview (FR шаардлага: зочин хэрэглэгч CV загварыг харах) */}
      <section id="templates" className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">CV Загварууд</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">3 мэргэжлийн загвар</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Таны мэргэжилд тохирсон загвар сонгож, хувийн мэдээллээ оруулан CV үүсгэнэ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(function (t, i) {
              return (
                <div key={i} className="bg-white border border-slate-200 rounded overflow-hidden hover:border-[#1e3a8a] hover:shadow-md transition group">
                  {/* Preview */}
                  <div className="aspect-[210/297] bg-white p-4 border-b border-slate-200 relative overflow-hidden">
                    {t.preview === "modern" && (
                      <div className="h-full flex flex-col">
                        <div className="bg-[#1e3a8a] -mx-4 -mt-4 px-4 py-3 mb-3">
                          <div className="h-3 bg-white rounded w-24 mb-1"></div>
                          <div className="h-1.5 bg-white/70 rounded w-16"></div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="h-1.5 bg-[#1e3a8a] rounded w-14 mb-1.5"></div>
                            <div className="h-1 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-5/6 mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-4/6"></div>
                          </div>
                          <div>
                            <div className="h-1.5 bg-[#1e3a8a] rounded w-20 mb-1.5"></div>
                            <div className="h-1 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-5/6 mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-3/4"></div>
                          </div>
                          <div>
                            <div className="h-1.5 bg-[#1e3a8a] rounded w-12 mb-1.5"></div>
                            <div className="flex gap-1 flex-wrap">
                              <div className="h-3 bg-[#1e3a8a]/10 rounded px-2 w-10"></div>
                              <div className="h-3 bg-[#1e3a8a]/10 rounded px-2 w-12"></div>
                              <div className="h-3 bg-[#1e3a8a]/10 rounded px-2 w-8"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {t.preview === "classic" && (
                      <div className="h-full flex flex-col">
                        <div className="text-center pb-3 mb-3 border-b-2 border-slate-800">
                          <div className="h-3 bg-slate-800 rounded w-32 mx-auto mb-1"></div>
                          <div className="h-1.5 bg-slate-400 rounded w-20 mx-auto"></div>
                        </div>
                        <div className="space-y-2.5">
                          <div>
                            <div className="h-1.5 bg-slate-800 rounded w-14 mb-1 uppercase"></div>
                            <div className="border-b border-slate-300 mb-1.5"></div>
                            <div className="h-1 bg-slate-300 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-300 rounded w-5/6 mb-1"></div>
                            <div className="h-1 bg-slate-300 rounded w-4/6"></div>
                          </div>
                          <div>
                            <div className="h-1.5 bg-slate-800 rounded w-20 mb-1"></div>
                            <div className="border-b border-slate-300 mb-1.5"></div>
                            <div className="h-1 bg-slate-300 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-300 rounded w-5/6 mb-1"></div>
                            <div className="h-1 bg-slate-300 rounded w-3/4"></div>
                          </div>
                          <div>
                            <div className="h-1.5 bg-slate-800 rounded w-16 mb-1"></div>
                            <div className="border-b border-slate-300 mb-1.5"></div>
                            <div className="h-1 bg-slate-300 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-300 rounded w-4/5"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {t.preview === "minimal" && (
                      <div className="h-full flex flex-col">
                        <div className="pb-3 mb-3">
                          <div className="h-4 bg-slate-900 rounded w-32 mb-1"></div>
                          <div className="h-1 bg-slate-400 rounded w-24"></div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="h-1 bg-slate-900 rounded w-14 mb-2"></div>
                            <div className="h-1 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-5/6"></div>
                          </div>
                          <div>
                            <div className="h-1 bg-slate-900 rounded w-20 mb-2"></div>
                            <div className="h-1 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-4/5 mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-3/4"></div>
                          </div>
                          <div>
                            <div className="h-1 bg-slate-900 rounded w-12 mb-2"></div>
                            <div className="h-1 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-1 bg-slate-200 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1e3a8a] transition">{t.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">Үнэгүй</span>
                    </div>
                    <p className="text-xs text-[#1e3a8a] font-semibold mb-2">{t.tagline}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            {token ? (
              <Link to="/cv/new" className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                CV үүсгэж эхлэх →
              </Link>
            ) : (
              <Link to="/register" className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                Бүртгүүлж CV үүсгэх →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Хэрхэн ажилладаг</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">4 алхамд ажилд ойртоно</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Энгийн бөгөөд үр дүнтэй үйл явц.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(function (s, i) {
              return (
                <div key={i} className="relative">
                  {/* Connecting line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+32px)] right-0 h-0.5 bg-slate-200"></div>
                  )}

                  <div className="bg-white border border-slate-200 rounded p-6 hover:border-[#1e3a8a] transition relative z-10">
                    <div className="w-12 h-12 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                      {s.num}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Яагаад CareerPrep</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
                Залуучуудын карьерын замд<br />
                <span className="text-[#1e3a8a]">итгэлтэй түнш</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Оюутан, шинэ төгсөгчдөд зориулсан бүрэн цогц платформ. Туршлагагүй байсан ч мэргэжлийн түвшинд CV үүсгэж, ярилцлагад итгэлтэйгээр орох боломжтой.
              </p>

              <ul className="space-y-3">
                {[
                  "100% Монгол хэлээр — ойлгомжтой, танил үг хэллэг",
                  "Үнэн зөв мэдээлэл — орон нутгийн ажлын зах зээлд тулгуурласан",
                  "Бүрэн үнэгүй — далд төлбөр байхгүй, бүртгэл нэг минутад",
                  "Аюулгүй — таны мэдээлэл шифрлэгдэж хадгалагдана",
                ].map(function (item, i) {
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                        ✓
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "3", label: "CV загвар", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { num: "25+", label: "Ярилцлагын асуулт", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { num: "16+", label: "Карьерын зөвлөмж", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                { num: "6+", label: "Дотоодын тэтгэлэг", color: "bg-amber-50 border-amber-200 text-amber-700" },
              ].map(function (s, i) {
                return (
                  <div key={i} className={"border rounded p-6 " + s.color}>
                    <div className="text-4xl md:text-5xl font-bold mb-2">{s.num}</div>
                    <div className="text-sm font-medium opacity-80">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Түгээмэл асуулт</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Танд асуулт байна уу?</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "CareerPrep үнэгүй юу?", a: "Тийм, бүх функц үнэгүй. Далд төлбөр байхгүй." },
              { q: "Хэн ашиглаж болох вэ?", a: "Их дээд сургуулийн оюутан, шинэ төгсөгч, ажил хайж буй хэн ч ашиглаж болно." },
              { q: "CV-гээ татаж авч болох уу?", a: "Тийм, үүсгэсэн CV-гээ PDF форматаар татаж авч болно." },
              { q: "Өгөгдөл минь аюулгүй юу?", a: "Таны нууц үг bcrypt хэшлэгдсэн, холболт HTTPS, дэлгэрэнгүйг Нууцлалын бодлогоос уншина." },
              { q: "Хэрхэн эхлэх вэ?", a: "Бүртгэгдээд и-мэйлээ баталгаажуулж, профайлаа бөглөөд шууд эхэлнэ. 2-3 минутын зөрөгтөй." },
            ].map(function (item, i) {
              return (
                <details key={i} className="bg-white border border-slate-200 rounded group">
                  <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-slate-900 flex items-center justify-between hover:bg-slate-50">
                    <span>{item.q}</span>
                    <span className="text-[#1e3a8a] group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#1e3a8a] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Өнөөдрөөс ажилдаа бэлдэж эхлэе
          </h2>
          <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Бүртгэл 1 минутад дуусна. Ямар ч төлбөр шаардахгүй.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {token ? (
              <Link to="/dashboard" className="bg-white text-[#1e3a8a] px-8 py-3 rounded text-sm font-bold hover:bg-slate-100 transition">
                Dashboard руу орох →
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-[#1e3a8a] px-8 py-3 rounded text-sm font-bold hover:bg-slate-100 transition">
                  Үнэгүй бүртгүүлэх →
                </Link>
                <Link to="/login" className="border-2 border-white/40 text-white px-8 py-3 rounded text-sm font-bold hover:bg-white/10 transition">
                  Нэвтрэх
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
                  <span className="text-white font-bold text-xs tracking-wide">CP</span>
                </div>
                <span className="text-base font-bold text-white">CareerPrep</span>
              </Link>
              <p className="text-xs leading-relaxed">Залуучуудын ажилд орох бэлтгэлийг дэмжих Монгол платформ.</p>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Боломжууд</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cv" className="hover:text-white transition">CV үүсгэх</Link></li>
                <li><Link to="/interview" className="hover:text-white transition">Ярилцлагын бэлтгэл</Link></li>
                <li><Link to="/advice" className="hover:text-white transition">Карьерын зөвлөмж</Link></li>
                <li><Link to="/scholarship" className="hover:text-white transition">Тэтгэлэг</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Компани</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition">Боломжууд</a></li>
                <li><a href="#templates" className="hover:text-white transition">CV загварууд</a></li>
                <li><a href="#how" className="hover:text-white transition">Хэрхэн ажилладаг</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Хууль эрх зүй</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-white transition">Нууцлал</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Нөхцөл</Link></li>
                <li><a href="mailto:info@careerprep.mn" className="hover:text-white transition">info@careerprep.mn</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
            <p className="text-xs">Монгол Улсад бүтээв.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}