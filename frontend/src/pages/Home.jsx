import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import CVPreview from "../components/CVPreview";

var SAMPLE_CV = {
  educations: [
    { school: "Монгол Улсын Их Сургууль", level: "Бакалавр", major: "Компьютерын ухаан", gpa: "3.8", start_year: "2018", end_year: "2022" },
  ],
  experiences: [
    { position: "Frontend Developer", company: "Tech Solutions LLC", start_date: "2022-06", end_date: "", description: "React, JavaScript ашиглан веб аппликейшн хөгжүүлэлт хийсэн. Баг хамт олонтой нягт хамтран ажилласан." },
    { position: "Дадлагажигч", company: "DataMon ХХК", start_date: "2021-06", end_date: "2021-12", description: "Мэдээллийн сангийн удирдлага, тайлан боловсруулалт." },
  ],
  skills: [],
};

var SAMPLE_INFO = {
  lastName: "Батбаяр", firstName: "Нарантуяа",
  email: "n.batbayar@email.com", phone: "9911-2233", address: "Улаанбаатар хот",
  about: "Туршлагатай програм хөгжүүлэгч. Баг хамт олонтой нягт хамтран ажиллах дуртай. Шинэ технологийг хурдан эзэмшдэг.",
  personalSkills: ["Багаар ажиллах", "Цагийн менежмент", "Харилцааны чадвар"],
  techSkills: ["JavaScript", "React", "Python", "SQL"],
  profSkills: ["Бичиг баримт боловсруулах"],
  artSkills: [], sportSkills: [],
  languages: [{ name: "Англи хэл", level: "Ахисан дунд шат" }],
  certs: [{ name: "AWS Certified Cloud Practitioner", organization: "Amazon", start_date: "2023" }],
  internships: [],
  awards: [{ name: "Оны шилдэг ажилтан — 2023", year: "2023" }],
};

function IconDoc() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconCap() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

export default function Home() {
  var { token } = useAuth();

  var features = [
    {
      icon: <IconDoc />,
      title: "CV үүсгэх",
      desc: "3 мэргэжлийн загвартай, алхам алхмаар дагадаг форм. PDF татаж авна.",
      link: "/cv",
    },
    {
      icon: <IconChat />,
      title: "Ярилцлагын бэлтгэл",
      desc: "30+ асуулт, 3 горим: Flashcard, Quiz, AI дадлага.",
      link: "/interview",
    },
    {
      icon: <IconBook />,
      title: "Карьерын зөвлөмж",
      desc: "CV бичих, ярилцлага, ажил олох, карьер ургуулах 20+ зөвлөмж.",
      link: "/advice",
    },
    {
      icon: <IconCap />,
      title: "Тэтгэлэг & Internship",
      desc: "Дотоодын тэтгэлэг, дадлагын хөтөлбөрүүд нэг газар.",
      link: "/scholarship",
    },
  ];

  var templates = [
    {
      name: "Монгол хэв маяг",
      tagline: "Орчин үеийн, минималист",
      desc: "Хурц навy өнгөтэй, IT болон дизайны салбарт тохиромжтой.",
      preview: "modern",
    },
    {
      name: "Ази хэв маяг",
      tagline: "Цэгцтэй, бүрэн мэдээлэлтэй",
      desc: "Санхүү, эрх зүй, боловсролын салбарт тохиромжтой загвар.",
      preview: "classic",
    },
    {
      name: "Европ хэв маяг",
      tagline: "Цэвэр, achievement-focused",
      desc: "Олон улсын болон modern ажлын орчинд тохирох, агуулга төвтэй загвар.",
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
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CareerPrep" className="w-9 h-9 drop-shadow-sm" />
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">Боломжууд</a>
            <a href="#templates" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">CV Загвар</a>
            <a href="#how" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">Хэрхэн ажилладаг</a>
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <Link to="/dashboard" className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden md:inline-block px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium transition">Нэвтрэх</Link>
                <Link to="/register" className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-md transition">
                  Эхлэх →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — light + violet accent */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Violet blob — top right */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-violet-200 dark:bg-violet-900/40 opacity-40 blur-3xl" />
        {/* Small secondary blob — bottom left */}
        <div className="pointer-events-none absolute bottom-0 -left-20 w-[280px] h-[280px] rounded-full bg-violet-100 dark:bg-violet-900/20 opacity-30 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-7">
                {[
                  { icon: "n", label: "Залуучуудын хөгжлийг дэмжих платформ" },
                ].map(function (p, i) {
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-100 dark:border-violet-800">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </span>
                  );
                })}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-700 dark:text-gray-200 leading-tight mb-5">
                Ирээдүйн амжилт<br />
                <span className="text-violet-500 dark:text-violet-400">эндээс эхэлнэ</span>
              </h1>

              <p className="text-sm md:text-base text-gray-400 dark:text-gray-500 leading-relaxed mb-8 max-w-lg">
                CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлгийн мэдээлэл авах — бүх зүйлсийг нэг газраас. Суурь эрхэд үнэгүй.
              </p>

              <div className="flex flex-wrap gap-10 mb-10">
                {token ? (
                  <Link to="/dashboard" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm text-center">
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-3 rounded-full text-sm font-semibold hover:shadow-md transition text-center">
                      Эхлэх →
                    </Link>
                    <a href="#features" className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-8 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition text-center">
                      Дэлгэрэнгүй
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
                <span>✓ Free эрхтэй</span>
                <span>✓ Монгол хэлээр</span>
                <span>✓ 1 минутад эхлэнэ</span>
              </div>
            </div>

            {/* CV preview cards */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[460px] h-[360px]">
                <div className="absolute top-0 left-0 w-[200px] h-[283px] rounded-xl shadow-xl overflow-hidden transform -rotate-6 z-10 border border-gray-100 dark:border-gray-700">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.252)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="modern" />
                  </div>
                </div>
                <div className="absolute top-4 right-0 w-[200px] h-[283px] rounded-xl shadow-xl overflow-hidden transform rotate-4 z-20 border border-gray-100 dark:border-gray-700">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.252)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="classic" />
                  </div>
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[210px] h-[297px] rounded-xl shadow-2xl overflow-hidden z-30 border border-violet-100 dark:border-violet-800">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.264)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="minimal" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip — faint violet */}
      <section className="bg-violet-50 dark:bg-violet-950/30 py-8 border-t border-violet-100 dark:border-violet-900/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "3", label: "CV загвар" },
            { value: "30+", label: "Ярилцлагын асуулт" },
            { value: "20+", label: "Карьерын зөвлөмж" },
            { value: "Free", label: "Суурь эрх" },
          ].map(function (s, i) {
            return (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-violet-900 dark:text-violet-100">{s.value}</div>
                <div className="text-[11px] text-violet-400 dark:text-violet-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Боломжууд</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Бүх шаардлагатай зүйл нэг газар</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(function (f, i) {
              return (
                <Link key={i} to={f.link}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-sm transition group">
                  <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CV Templates */}
      <section id="templates" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">CV Загварууд</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">3 мэргэжлийн загвар</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
              Таны мэргэжилд тохирсон загвар сонгож, хувийн мэдээллээ оруулан CV үүсгэнэ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(function (t, i) {
              return (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-sm transition group">
                  <div className="h-[380px] bg-white border-b border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div style={{
                      position: "absolute", top: 0, left: 0,
                      width: "794px", transformOrigin: "top left",
                      transform: "scale(0.385)", pointerEvents: "none",
                    }}>
                      <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template={t.preview} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition mb-0.5">{t.name}</h3>
                    <p className="text-xs text-violet-600 font-medium mb-1">{t.tagline}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            {token ? (
              <Link to="/cv/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition">
                CV үүсгэж эхлэх →
              </Link>
            ) : (
              <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition">
                Бүртгүүлж CV үүсгэх →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Хэрхэн ажилладаг</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">4 алхамд ажилд ойртоно</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(function (s, i) {
              return (
                <div key={i} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] right-0 h-px bg-gray-100 dark:bg-gray-700"></div>
                  )}
                  <div className="relative z-10">
                    <div className="w-10 h-10 border-2 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center font-bold text-base mb-4">
                      {s.num}
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">{s.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Түгээмэл асуулт</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Танд асуулт байна уу?</h2>
          </div>

          <div className="space-y-2">
            {[
              { q: "CareerPrep системийн үнийн бодлого ямар вэ?", a: "Суурь функцүүд (CV загвар, ярилцлагын асуулт, зөвлөмж) үнэгүй. AI хэсэгтэй функцэд сарын лимит байна — Free: 15 AI / 5 орчуулга, Pro: 80 AI / 40 орчуулга (₮5,900/сар)." },
              { q: "Хэн ашиглаж болох вэ?", a: "Их дээд сургуулийн оюутан, шинэ төгсөгч, ажил хайж буй хэн ч ашиглаж болно." },
              { q: "CV загвараа татаж авч болох уу?", a: "Тийм, үүсгэсэн CV загвараа PDF форматаар татаж авч болно." },
              { q: "Өгөгдөл минь аюулгүй юу?", a: "Таны нууц үг bcrypt хэшлэгдсэн, холболт HTTPS-ээр шифрлэгдсэн." },
              { q: "Хэрхэн эхлэх вэ?", a: "Бүртгэгдээд и-мэйлээ баталгаажуулж, профайлаа бөглөөд шууд эхэлнэ." },
            ].map(function (item, i) {
              return (
                <details key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl group">
                  <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition">
                    <span>{item.q}</span>
                    <span className="text-violet-600 group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                    {item.a}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500 to-violet-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Өнөөдрөөс ажилдаа бэлдэж эхлэе
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-xl mx-auto">
            Бүртгэл 1 минутад дуусна. Суурь эрхэд үнэгүй.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {token ? (
              <Link to="/dashboard" className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-2.5 rounded-lg text-sm font-bold transition shadow-sm">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-2.5 rounded-lg text-sm font-bold transition shadow-sm">
                  Бүртгүүлэх →
                </Link>
                <Link to="/login" className="border border-white/40 text-white hover:bg-white/10 px-8 py-2.5 rounded-lg text-sm font-bold transition">
                  Нэвтрэх
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src="/logo.svg" alt="CareerPrep" className="w-8 h-8 drop-shadow-sm" />
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
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Навигаци</p>
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
                <li><a href="mailto:g.badrakh98@gmail.com" className="hover:text-white transition">g.badrakh98@gmail.com</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
            <p className="text-xs">Монгол Улсад бүтээв.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
