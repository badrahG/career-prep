import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  FileText, 
  MessageSquare, 
  Award, 
  Lightbulb, 
  ArrowRight,
  Star,
  CheckCircle2 
} from "lucide-react";

function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0 
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(current);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const features = [
  {
    icon: FileText,
    title: "CV үүсгэх",
    desc: "Мэргэжлийн загвараас сонгож, алхам алхмаар CV үүсгэн PDF татаж авах боломжтой.",
  },
  {
    icon: MessageSquare,
    title: "Ярилцлагын бэлтгэл",
    desc: "Flashcard, Quiz, STAR аргаар ярилцлагад бүрэн бэлтгэж, мэдлэгээ шалгах боломжтой.",
  },
  {
    icon: Award,
    title: "Тэтгэлгийн мэдээлэл",
    desc: "10+ дотоодын тэтгэлгийн мэдээлэл, шүүлтүүр, бэлтгэлийн checklist хөтлөх.",
  },
  {
    icon: Lightbulb,
    title: "Карьерын зөвлөмж",
    desc: "CV бичих зөвлөмж, ярилцлагын стратеги, ажлын сайтын холбоосууд нэг дор.",
  },
];

const steps = [
  { num: "01", title: "Бүртгүүлэх", desc: "И-мэйл хаягаараа үнэгүй бүртгүүлж, хувийн профайлаа үүсгэнэ." },
  { num: "02", title: "CV бэлдэх", desc: "Боловсрол, туршлага, чадвараа оруулж, загвар сонгож CV үүсгэнэ." },
  { num: "03", title: "Бэлтгэл хийх", desc: "Ярилцлагын асуулт судалж, тест бөглөж, STAR аргаар дадлагажна." },
  { num: "04", title: "Ажилд бэлэн", desc: "CV татаж авч, бэлтгэлээ дуусгаж, итгэлтэйгээр ярилцлагад орно." },
];

const testimonials = [
  { name: "Б. Анхзаяа", role: "МУИС, 4-р курс", text: "CV загвар маш тохиромжтой байсан. Анхны ажлын ярилцлагадаа итгэлтэй орсон." },
  { name: "Д. Тэмүүлэн", role: "ШУТИС, төгсөгч", text: "Ярилцлагын Quiz маш хэрэгтэй байсан. STAR арга дээр дадлага хийснээр бүтэцтэй хариулж сурсан." },
  { name: "О. Сарантуяа", role: "Хүмүүнлэгийн ИС", text: "Тэтгэлгийн мэдээлэл нэг дор байгаа нь маш тохиромжтой. Checklist ашиглаж бэлтгэлээ хийсэн." },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top announcement bar */}
      <div className="bg-[#1e3a8a] text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <span>Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ</span>
          <span className="hidden md:block">info@careerprep.mn · +976 8839 5886</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 bg-white border-b border-slate-200 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
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
          
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-4 py-2 text-sm text-slate-700 hover:text-[#1e3a8a] font-medium">Боломжууд</a>
            <a href="#how" className="px-4 py-2 text-sm text-slate-700 hover:text-[#1e3a8a] font-medium">Ашиглах заавар</a>
            <a href="#stats" className="px-4 py-2 text-sm text-slate-700 hover:text-[#1e3a8a] font-medium">Статистик</a>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/login" 
              className="text-slate-700 hover:text-[#1e3a8a] text-sm font-medium px-4 py-2"
            >
              Нэвтрэх
            </Link>
            <Link 
              to="/register" 
              className="bg-[#1e3a8a] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#1e40af] transition"
            >
              Бүртгүүлэх
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <AnimatedSection className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded text-xs font-medium text-slate-700 mb-6">
                <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full"></span>
                Залуучуудад зориулсан карьерын платформ
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Ажилд орох бэлтгэлээ<br/>
                <span className="text-[#1e3a8a]">нэг дороос</span> хий.
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
                CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлгийн мэдээлэл авах — Монгол залуучуудын 
                карьерын эхлэлийг дэмжих мэргэжлийн платформ.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                <Link 
                  to="/register" 
                  className="group bg-[#1e3a8a] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1e40af] transition flex items-center gap-2"
                >
                  Үнэгүй эхлэх
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a 
                  href="#features" 
                  className="border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded text-sm font-semibold hover:border-slate-400 transition"
                >
                  Дэлгэрэнгүй
                </a>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-9 h-9 rounded-full border-2 border-slate-50 bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600"
                    >
                      {["А", "Б", "Д", "О"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">1,000+ оюутан</p>
                  <p className="text-xs text-slate-500">суралцагчдад зориулсан</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="lg:col-span-5">
              <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide uppercase">Миний CV</span>
                  <span className="bg-white/15 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Бэлэн
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#1e3a8a]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Modern Template</p>
                      <p className="text-xs text-slate-500">Сүүлд шинэчилсэн: 2026.04.15</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 mb-6">
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-200 rounded p-3 text-center">
                      <p className="text-xl font-bold text-[#1e3a8a]">85%</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Quiz</p>
                    </div>
                    <div className="border border-slate-200 rounded p-3 text-center">
                      <p className="text-xl font-bold text-[#1e3a8a]">12</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Судалсан</p>
                    </div>
                    <div className="border border-slate-200 rounded p-3 text-center">
                      <p className="text-xl font-bold text-[#1e3a8a]">3</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">CV</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* University strip */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-xs text-slate-500 uppercase tracking-wider mb-4">
            Монголын тэргүүлэх их, дээд сургуулиудын оюутнуудад
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 text-slate-400 font-semibold text-sm tracking-wide">
            {["МУИС", "ШУТИС", "МУБИС", "ХААИС", "СУИС", "СЭЗИС"].map((name, i) => (
              <span key={i} className="hover:text-[#1e3a8a] transition">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12 max-w-3xl">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-3">Боломжууд</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ажилд орох бэлтгэлд хэрэгтэй бүх хэрэгсэл
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Бэлтгэлийн эхний алхмаас ярилцлагад орох хүртэлх замд таныг дагалдах мэргэжлийн платформ.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200 rounded overflow-hidden">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.08} className={
                "p-6 bg-white hover:bg-slate-50 transition " +
                (i < features.length - 1 ? "border-b md:border-b-0 md:border-r border-slate-200 " : "") +
                (i < 2 ? "lg:border-b-0 " : "")
              }>
                <div className="w-10 h-10 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded flex items-center justify-center text-[#1e3a8a] mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12 max-w-3xl">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-3">Ашиглах заавар</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Хэрхэн ажилладаг вэ?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Дөрвөн энгийн алхамаар ажилд бэлтгэлээ хий.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <div className="bg-white border border-slate-200 rounded p-6 h-full relative">
                  <div className="absolute top-0 left-0 w-12 h-1 bg-[#1e3a8a]"></div>
                  <p className="text-3xl font-bold text-slate-300 mb-4">{s.num}</p>
                  <h3 className="font-bold text-slate-900 mb-2 text-base">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section id="stats" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12 max-w-3xl">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-3">Статистик</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Яагаад энэ платформ хэрэгтэй вэ?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Монголын хөдөлмөрийн зах зээлийн бодит тоо баримт.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-200 rounded overflow-hidden">
            {[
              { target: 150000, suffix: "+", label: "Оюутан суралцагч", sub: "Их, дээд сургуульд" },
              { target: 88100, suffix: "", label: "Ажилгүй иргэд", sub: "20–24 нас тэргүүлж буй" },
              { target: 20, suffix: "", label: "Их, дээд сургууль", sub: "Улсын хэмжээнд" },
              { target: 80000, suffix: "", label: "NEET залуучууд", sub: "Боловсрол, ажилгүй" },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.08} className={
                "bg-white p-6 md:p-8 " +
                (i < 3 ? "border-b md:border-b-0 md:border-r border-slate-200 " : "") +
                (i === 0 && "border-b") + " " +
                (i === 1 ? "border-b md:border-b-0 " : "")
              }>
                <p className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2">
                  <CountUp target={s.target} suffix={s.suffix} />
                </p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </AnimatedSection>
            ))}
          </div>
          
          <p className="text-xs text-slate-400 mt-4">Эх сурвалж: ҮСХ 2024, 1212.mn</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12 max-w-3xl">
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-3">Сэтгэгдэл</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Хэрэглэгчдийн сэтгэгдэл
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-white border border-slate-200 rounded p-6 h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-[#1e3a8a] text-[#1e3a8a]" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-[#1e3a8a] font-bold text-sm">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <div className="bg-[#1e3a8a] rounded p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Карьераа өнөөдрөөс эхлүүл
              </h2>
              <p className="text-base text-slate-200 mb-8 max-w-2xl mx-auto">
                Үнэгүй бүртгүүлж, CV үүсгэж, ярилцлагад бэлтгэж эхлээрэй.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link 
                  to="/register" 
                  className="group bg-white text-[#1e3a8a] px-8 py-3 rounded text-sm font-semibold hover:bg-slate-100 transition flex items-center gap-2"
                >
                  Үнэгүй бүртгүүлэх
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="border border-white/30 text-white px-8 py-3 rounded text-sm font-semibold hover:bg-white/10 transition"
                >
                  Нэвтрэх
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white flex items-center justify-center rounded">
                  <span className="text-[#1e3a8a] font-bold text-sm tracking-wide">CP</span>
                </div>
                <span className="text-base font-bold text-white">CareerPrep</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ.
              </p>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Платформ</p>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-slate-400 hover:text-white transition">CV үүсгэх</a>
                <a href="#features" className="block text-slate-400 hover:text-white transition">Ярилцлагын бэлтгэл</a>
                <a href="#features" className="block text-slate-400 hover:text-white transition">Тэтгэлэг</a>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Мэдээлэл</p>
              <div className="space-y-2 text-sm">
                <a href="#how" className="block text-slate-400 hover:text-white transition">Хэрхэн ажилладаг</a>
                <a href="#stats" className="block text-slate-400 hover:text-white transition">Статистик</a>
                <a href="#" className="block text-slate-400 hover:text-white transition">Тусламж</a>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Холбоо барих</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>g.badrakh98@gmail.com</p>
                <p>+976 8839 5886</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500">
              © 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.
            </span>
            <div className="flex gap-5 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-white transition">Нууцлалын бодлого</Link>
              <Link to="/terms" className="hover:text-white transition">Үйлчилгээний нөхцөл</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}