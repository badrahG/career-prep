import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import CVPreview from "../components/CVPreview";

var personalSkills = ["Багаар ажиллах", "Ачаалал даах", "Дасан зохицох", "Хувийн сахилга бат", "Цагийн менежмент", "Санал бодлоо илэрхийлэх", "Шинийг санаачлах", "Манлайлал ба удирдлага", "Асуудал шийдвэрлэх", "Харилцааны чадвар", "Шийдвэр гаргах", "Анхааралтай сонсох", "Илтгэх", "Хариуцлага хүлээх", "Нягт нямбай", "Үлгэр дуурайлал үзүүлэх", "Баг хамт олонтой харилцах", "Хүнтэй ажиллах хандлага"];
var techSkills = ["Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Adobe Photoshop", "AutoCAD", "Python", "HTML/CSS", "JavaScript", "React", "SQL", "Git", "Figma", "Adobe Illustrator", "CorelDraw", "SPSS", "Adobe Premiere"];
var profSkills = ["Компьютерын хэрэглээ", "Жолоо барих", "Бичиг баримт боловсруулах", "Дүн шинжилгээ хийх", "Баримт бичиг, тайлан боловсруулах", "Автомашины мэдлэг", "Бичиг баримт бүрдүүлэх", "Техникийн англи хэл", "Захиргааны менежмент"];
var artSkills = ["Дуулах", "Бүжиглэх", "Зураг зурах", "Гар урлал", "Хөгжмийн зэмсэг тоглох", "Яруу найраг", "Жүжиглэх"];
var sportSkills = ["Сагсан бөмбөг", "Гар бөмбөг", "Ширээний теннис", "Шатар", "Хөл бөмбөг", "Кибер спорт", "Усан спорт", "Хөнгөн атлетик", "Бокс"];
var languageOptions = ["Англи хэл", "Орос хэл", "Солонгос хэл", "Хятад хэл", "Япон хэл", "Герман хэл", "Франц хэл", "Турк хэл"];
var levelOptions = ["Анхан шат", "Суурьтай анхан шат", "Дунд шат", "Ахисан дунд шат", "Бүрэн эзэмшсэн"];
var jobCategories = ["Мэдээллийн технологи", "Банк санхүү", "Барилга", "Боловсрол", "Маркетинг", "Худалдаа", "Эрүүл мэнд", "Уул уурхай", "Бусад"];
var eduLevels = ["Доктор", "Магистр", "Бакалавр", "Тусгай дунд", "Бүрэн дунд"];

var inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
var labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

function EduForm(props) {
  var edu = props.edu; var i = props.index; var onUpdate = props.onUpdate; var onRemove = props.onRemove; var canRemove = props.canRemove;
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 mb-4 bg-gray-50 dark:bg-gray-700/50">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Боловсрол #{i + 1}</span>
        {canRemove && <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:text-red-700 font-medium">Устгах</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Түвшин <span className="text-red-500">*</span></label><select value={edu.level} onChange={function(e) { onUpdate("level", e.target.value); }} className={inputCls}><option value="">Сонгоно уу</option>{eduLevels.map(function(o) { return <option key={o} value={o}>{o}</option>; })}</select></div>
        <div><label className={labelCls}>Сургууль <span className="text-red-500">*</span></label><input defaultValue={edu.school} onBlur={function(e) { onUpdate("school", e.target.value); }} placeholder="ШУТИС" className={inputCls} /></div>
        <div><label className={labelCls}>Салбар</label><select value={edu.major_field} onChange={function(e) { onUpdate("major_field", e.target.value); }} className={inputCls}><option value="">Сонгоно уу</option>{jobCategories.map(function(o) { return <option key={o} value={o}>{o}</option>; })}</select></div>
        <div><label className={labelCls}>Мэргэжил <span className="text-red-500">*</span></label><input defaultValue={edu.major} onBlur={function(e) { onUpdate("major", e.target.value); }} placeholder="Программ хангамж" className={inputCls} /></div>
        <div><label className={labelCls}>Голч дүн</label><input defaultValue={edu.gpa} onBlur={function(e) { onUpdate("gpa", e.target.value); }} placeholder="3.45" className={inputCls} /></div>
        <div><label className={labelCls}>Элссэн он <span className="text-red-500">*</span></label><input defaultValue={edu.start_year} onBlur={function(e) { onUpdate("start_year", e.target.value); }} placeholder="2022" className={inputCls} /></div>
        <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={edu.currently} onChange={function(e) { onUpdate("currently", e.target.checked); }} className="w-4 h-4 accent-violet-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Одоо сурч байгаа</span></div>
        {!edu.currently && <div><label className={labelCls}>Төгссөн он</label><input defaultValue={edu.end_year} onBlur={function(e) { onUpdate("end_year", e.target.value); }} placeholder="2026" className={inputCls} /></div>}
      </div>
    </div>
  );
}

function ExpForm(props) {
  var exp = props.exp; var i = props.index; var onUpdate = props.onUpdate; var onRemove = props.onRemove; var canRemove = props.canRemove;
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 mb-4 bg-gray-50 dark:bg-gray-700/50">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Туршлага #{i + 1}</span>
        {canRemove && <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:text-red-700 font-medium">Устгах</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Чиглэл <span className="text-red-500">*</span></label><select value={exp.category} onChange={function(e) { onUpdate("category", e.target.value); }} className={inputCls}><option value="">Сонгоно уу</option>{jobCategories.map(function(o) { return <option key={o} value={o}>{o}</option>; })}</select></div>
        <div><label className={labelCls}>Албан тушаал <span className="text-red-500">*</span></label><input defaultValue={exp.position} onBlur={function(e) { onUpdate("position", e.target.value); }} placeholder="Программист" className={inputCls} /></div>
        <div><label className={labelCls}>Байгууллага <span className="text-red-500">*</span></label><input defaultValue={exp.company} onBlur={function(e) { onUpdate("company", e.target.value); }} placeholder="Компани" className={inputCls} /></div>
        <div><label className={labelCls}>Орсон огноо <span className="text-red-500">*</span></label><input type="date" defaultValue={exp.start_date} onBlur={function(e) { onUpdate("start_date", e.target.value); }} className={inputCls} /></div>
        <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={exp.currently} onChange={function(e) { onUpdate("currently", e.target.checked); }} className="w-4 h-4 accent-violet-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Одоо ажиллаж байгаа</span></div>
        {!exp.currently && <div><label className={labelCls}>Гарсан огноо</label><input type="date" defaultValue={exp.end_date} onBlur={function(e) { onUpdate("end_date", e.target.value); }} className={inputCls} /></div>}
        <div className="col-span-2"><label className={labelCls}>Ажлын тухай</label><textarea defaultValue={exp.description} onBlur={function(e) { onUpdate("description", e.target.value); }} placeholder="Хийсэн ажлууд..." rows={2} className={inputCls} /></div>
      </div>
    </div>
  );
}

function SkillToggle(props) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.items.map(function(s) {
        var active = props.selected.includes(s);
        return <button key={s} type="button" onClick={function() { props.onToggle(s); }} className={"px-3 py-1.5 rounded-xl text-xs font-medium transition border " + (active ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500")}>{s}</button>;
      })}
    </div>
  );
}

export default function CVEdit() {
  var navigate = useNavigate();
  var params = useParams();
  var cvId = params.id;

  var [step, setStep] = useState(1);
  var [saving, setSaving] = useState(false);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);
  var [cvName, setCvName] = useState("");
  var [template, setTemplate] = useState("modern");
  var [photoUrl, setPhotoUrl] = useState("");
  var [photoUploading, setPhotoUploading] = useState(false);
  var [info, setInfo] = useState({ lastName: "", firstName: "", birthDate: "", gender: "", regNo: "", license: "", marital: "", about: "", salaryExpect: "" });
  var [contact, setContact] = useState({ email: "", phone: "", phone2: "", address: "", linkedin: "" });
  var [educations, setEducations] = useState([{ level: "", school: "", major: "", major_field: "", gpa: "", start_year: "", end_year: "", currently: false }]);
  var [experiences, setExperiences] = useState([{ category: "", position: "", company: "", description: "", start_date: "", end_date: "", currently: false }]);
  var [selectedPersonal, setSelectedPersonal] = useState([]);
  var [selectedTech, setSelectedTech] = useState([]);
  var [selectedProf, setSelectedProf] = useState([]);
  var [selectedArt, setSelectedArt] = useState([]);
  var [selectedSport, setSelectedSport] = useState([]);
  var [langList, setLangList] = useState([{ name: "", level: "" }]);
  var [certs, setCerts] = useState([{ name: "", organization: "", start_date: "", end_date: "", file_url: "" }]);
  var [certUploading, setCertUploading] = useState({});
  var [interns, setInterns] = useState([{ company: "", title: "", description: "", start_date: "", end_date: "" }]);
  var [awards, setAwards] = useState([{ name: "", year: "" }]);

  var [showMobilePreview, setShowMobilePreview] = useState(false);
  var [modalPreviewScale, setModalPreviewScale] = useState(1);
  var modalPreviewRef = useRef(null);

  useEffect(function () {
    API.get("/cv/" + cvId)
      .then(function(res) {
        var cv = res.data;
        setCvName(cv.name || "");
        setTemplate(cv.template_type || "modern");
        var p = {};
        try { p = JSON.parse(cv.personal_info || "{}"); } catch(e) { p = {}; }
        setInfo({ lastName: p.lastName || "", firstName: p.firstName || "", birthDate: p.birthDate || "", gender: p.gender || "", regNo: p.regNo || "", license: p.license || "", marital: p.marital || "", about: p.about || "", salaryExpect: p.salaryExpect || "" });
        setContact({ email: p.email || "", phone: p.phone || "", phone2: p.phone2 || "", address: p.address || "", linkedin: p.linkedin || "" });
        setPhotoUrl(p.photoUrl || "");
        setSelectedPersonal(p.personalSkills || []);
        setSelectedTech(p.techSkills || []);
        setSelectedProf(p.profSkills || []);
        setSelectedArt(p.artSkills || []);
        setSelectedSport(p.sportSkills || []);
        if (p.languages && p.languages.length > 0) setLangList(p.languages);
        if (p.certs && p.certs.length > 0) setCerts(p.certs);
        if (p.internships && p.internships.length > 0) setInterns(p.internships);
        if (p.awards && p.awards.length > 0) setAwards(p.awards);
        if (cv.educations && cv.educations.length > 0) {
          setEducations(cv.educations.map(function(e) { return { level: "", school: e.school || "", major: e.major || "", major_field: "", gpa: e.gpa != null ? String(e.gpa) : "", start_year: e.start_year != null ? String(e.start_year) : "", end_year: e.end_year != null ? String(e.end_year) : "", currently: e.end_year == null }; }));
        }
        if (cv.experiences && cv.experiences.length > 0) {
          setExperiences(cv.experiences.map(function(e) { return { category: "", position: e.position || "", company: e.company || "", description: e.description || "", start_date: e.start_date || "", end_date: e.end_date === "Одоо" ? "" : (e.end_date || ""), currently: e.end_date === "Одоо" }; }));
        }
      })
      .catch(function() { setNotFound(true); })
      .finally(function() { setLoading(false); });
  }, [cvId]);


  useEffect(function () {
    if (!showMobilePreview) return;
    var t = setTimeout(function () {
      if (!modalPreviewRef.current) return;
      var available = modalPreviewRef.current.clientWidth - 32;
      setModalPreviewScale(Math.min(1, available / 794));
    }, 0);
    return function () { clearTimeout(t); };
  }, [showMobilePreview]);

  function removeAt(arr, idx) { var f = []; for (var j = 0; j < arr.length; j++) { if (j !== idx) f.push(arr[j]); } return f; }
  function toggleSkill(arr, setArr, val) { if (arr.includes(val)) { setArr(removeAt(arr, arr.indexOf(val))); } else { setArr([].concat(arr, [val])); } }
  function upd(setter, field, value) { setter(function(prev) { var n = {}; for (var k in prev) n[k] = prev[k]; n[field] = value; return n; }); }
  function updList(list, setList, i, field, val) { var c = list.slice(); var item = {}; for (var k in c[i]) item[k] = c[i][k]; item[field] = val; c[i] = item; setList(c); }

  async function uploadCertFile(i, file) {
    if (!file) return;
    setCertUploading(function(prev) { var n = Object.assign({}, prev); n[i] = true; return n; });
    try {
      var form = new FormData(); form.append("file", file);
      var res = await API.post("/cv/upload-certificate", form, { headers: { "Content-Type": "multipart/form-data" } });
      updList(certs, setCerts, i, "file_url", res.data.cert_file_url);
      toast.success("Файл амжилттай хуулагдлаа");
    } catch (e) { toast.error(e?.response?.data?.detail || "Файл хуулахад алдаа гарлаа"); }
    finally { setCertUploading(function(prev) { var n = Object.assign({}, prev); n[i] = false; return n; }); }
  }

  function handlePhoto(e) {
    var file = e.target.files[0]; if (!file) return;
    setPhotoUploading(true);
    var formData = new FormData(); formData.append("file", file);
    API.post("/cv/upload-photo", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(function(res) { setPhotoUrl(res.data.photo_url); toast.success("Зураг амжилттай!"); })
      .catch(function() { toast.error("Зураг оруулахад алдаа"); })
      .finally(function() { setPhotoUploading(false); });
  }

  function handleSave() {
    if (!cvName.trim()) { toast.error("CV нэр оруулна уу"); return; }
    setSaving(true);
    var pInfo = JSON.stringify({ lastName: info.lastName, firstName: info.firstName, birthDate: info.birthDate, gender: info.gender, regNo: info.regNo, license: info.license, marital: info.marital, about: info.about, salaryExpect: info.salaryExpect, email: contact.email, phone: contact.phone, phone2: contact.phone2, address: contact.address, linkedin: contact.linkedin, photoUrl: photoUrl, personalSkills: selectedPersonal, techSkills: selectedTech, profSkills: selectedProf, artSkills: selectedArt, sportSkills: selectedSport, languages: langList.filter(function(l) { return l.name; }), certs: certs.filter(function(c) { return c.name; }), internships: interns.filter(function(n) { return n.company; }), awards: awards.filter(function(a) { return a.name; }) });
    var edus = educations.filter(function(e) { return e.school; }).map(function(e) { return { school: e.school, major: e.major || e.major_field, start_year: parseInt(e.start_year) || null, end_year: e.currently ? null : (parseInt(e.end_year) || null), gpa: parseFloat(e.gpa) || null }; });
    var exps = experiences.filter(function(e) { return e.company; }).map(function(e) { return { company: e.company, position: e.position, start_date: e.start_date, end_date: e.currently ? "Одоо" : e.end_date, description: e.description }; });
    var sk = selectedPersonal.map(function(s) { return { skill_name: s, skill_type: "soft", level: "intermediate" }; });
    sk = sk.concat(selectedTech.map(function(s) { return { skill_name: s, skill_type: "technical", level: "intermediate" }; }));
    sk = sk.concat(langList.filter(function(l) { return l.name; }).map(function(l) { return { skill_name: l.name, skill_type: "language", level: l.level }; }));
    API.put("/cv/" + cvId, { name: cvName, template_type: template, personal_info: pInfo, educations: edus, experiences: exps, skills: sk })
      .then(function() { toast.success("CV амжилттай шинэчлэгдлээ!"); navigate("/cv/" + cvId); })
      .catch(function(err) { toast.error((err.response && err.response.data && err.response.data.detail) || "Алдаа гарлаа"); })
      .finally(function() { setSaving(false); });
  }

  var stepNames = ["Загвар", "Ерөнхий", "Холбоо барих", "Боловсрол", "Туршлага", "Хувийн чадвар", "Мэргэжлийн чадвар", "Хэл", "Сургалт", "Дадлага", "Шагнал", "Хадгалах"];
  var totalSteps = stepNames.length;
  var progressPct = Math.round((step / totalSteps) * 100);

  function Inp(props) {
    return <div className={props.cls || ""}><label className={labelCls}>{props.label}</label><input type={props.type || "text"} defaultValue={props.value} onBlur={function(e) { props.onChange(e.target.value); }} placeholder={props.placeholder} className={inputCls} autoComplete="off" /></div>;
  }
  function Sel(props) {
    return <div className={props.cls || ""}><label className={labelCls}>{props.label}</label><select value={props.value} onChange={function(e) { props.onChange(e.target.value); }} className={inputCls}><option value="">Сонгоно уу</option>{props.options.map(function(o) { return <option key={o} value={o}>{o}</option>; })}</select></div>;
  }

  var previewCvData = {
    educations: educations.filter(function(ed) { return ed.school; }).map(function(ed) { return { school: ed.school, major: ed.major || ed.major_field, level: ed.level, gpa: ed.gpa ? parseFloat(ed.gpa) : null, start_year: ed.start_year ? parseInt(ed.start_year) : null, end_year: ed.currently ? null : (ed.end_year ? parseInt(ed.end_year) : null) }; }),
    experiences: experiences.filter(function(ex) { return ex.company; }).map(function(ex) { return { company: ex.company, position: ex.position, start_date: ex.start_date, end_date: ex.currently ? "Одоо" : ex.end_date, description: ex.description }; }),
    skills: [],
  };
  var previewInfo = Object.assign({}, info, contact, {
    photoUrl: photoUrl,
    personalSkills: selectedPersonal,
    techSkills: selectedTech,
    profSkills: selectedProf,
    artSkills: selectedArt,
    sportSkills: selectedSport,
    languages: langList.filter(function(l) { return l.name; }),
    certs: certs.filter(function(c) { return c.name; }),
    internships: interns.filter(function(n) { return n.company; }),
    awards: awards.filter(function(a) { return a.name; }),
  });

  if (loading) {
    return <Layout><div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Ачааллаж байна...</div></div></Layout>;
  }
  if (notFound) {
    return <Layout><div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-gray-500 text-sm">CV олдсонгүй эсвэл нэвтрэх эрхгүй байна.</p><Link to="/cv" className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">← CV жагсаалт руу буцах</Link></div></Layout>;
  }

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/cv" className="hover:text-violet-600 transition">CV</Link>
          <span>/</span>
          <Link to={"/cv/" + cvId} className="hover:text-violet-600 transition">Дэлгэрэнгүй</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Засах</span>
          <span className="ml-auto text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">Засварлах горим</span>
        </div>

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV засах</p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">CV шинэчлэх</h1>
        </div>

        {/* Progress bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-4 mb-5">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{stepNames[step - 1]}</span>
            <span className="text-violet-600 font-semibold">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: progressPct + "%" }} />
          </div>
        </div>

        {/* Step tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
          {stepNames.map(function(t, idx) {
            var s = idx + 1;
            var cls = "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ";
            if (step === s) cls += "bg-violet-600 text-white border-violet-600";
            else if (step > s) cls += "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800";
            else cls += "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500";
            return <button key={idx} type="button" onClick={function() { setStep(s); }} className={cls}>{s}. {t}</button>;
          })}
        </div>

        {/* Main: form + side preview */}
        <div className="flex gap-5 items-start">

          {/* Left: form */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 md:p-8">

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">CV нэр болон загвар</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">CV-дээ нэр өгч загвар сонгоно уу.</p>
                  <Inp label="CV нэр *" value={cvName} onChange={function(v) { setCvName(v); }} placeholder="Жишээ: Программистын CV" cls="mb-6" />
                  <label className={labelCls}>Загвар</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {[{ id: "modern", name: "Монгол хэв маяг", desc: "Монголын компаниудад нийцсэн" }, { id: "classic", name: "Ази хэв маяг", desc: "Цэгцтэй, бүрэн CV" }, { id: "minimal", name: "Европ хэв маяг", desc: "Европ хэв маягийг харуулсан" }].map(function(t) {
                      var active = template === t.id;
                      return <button key={t.id} type="button" onClick={function() { setTemplate(t.id); }} className={"border rounded-2xl p-4 text-left transition " + (active ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500")}><div className="w-full h-20 rounded-xl mb-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 flex items-center justify-center"><span className="text-xs text-gray-400 dark:text-gray-400">{t.name}</span></div><p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.desc}</p>{active && <p className="text-xs text-violet-600 font-semibold mt-1">✓ Сонгосон</p>}</button>;
                    })}
                  </div>
                  <div>
                    <label className={labelCls}>Профайл зураг</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-28 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                        {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <span className="text-gray-300 dark:text-gray-500 text-3xl">?</span>}
                      </div>
                      <div><input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />{photoUploading && <p className="text-xs text-violet-600 mt-1">Оруулж байна...</p>}</div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Ерөнхий мэдээлэл</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Хувийн мэдээллээ оруулна уу.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Inp label="Овог *" value={info.lastName} onChange={function(v) { upd(setInfo, "lastName", v); }} placeholder="Ганбаатар" />
                    <Inp label="Нэр *" value={info.firstName} onChange={function(v) { upd(setInfo, "firstName", v); }} placeholder="Бадрах" />
                    <Inp label="Төрсөн он" value={info.birthDate} onChange={function(v) { upd(setInfo, "birthDate", v); }} type="date" />
                    <Sel label="Хүйс" value={info.gender} onChange={function(v) { upd(setInfo, "gender", v); }} options={["Эрэгтэй", "Эмэгтэй"]} />
                    <Inp label="Регистрийн дугаар" value={info.regNo} onChange={function(v) { upd(setInfo, "regNo", v); }} placeholder="ИЭ04242518" />
                    <Sel label="Жолооны үнэмлэх" value={info.license} onChange={function(v) { upd(setInfo, "license", v); }} options={["Байхгүй", "B", "C", "D", "E"]} />
                    <Sel label="Гэрлэлтийн байдал" value={info.marital} onChange={function(v) { upd(setInfo, "marital", v); }} options={["Гэрлээгүй", "Гэрлэсэн"]} />
                    <Inp label="Цалингийн хүлээлт" value={info.salaryExpect} onChange={function(v) { upd(setInfo, "salaryExpect", v); }} placeholder="1,200,000-1,500,000" />
                  </div>
                  <div className="mt-4"><label className={labelCls}>Миний тухай</label><textarea value={info.about} onChange={function(e) { upd(setInfo, "about", e.target.value); }} placeholder="Өөрийнхөө тухай товч бичнэ үү..." rows={3} className={inputCls} /></div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Холбоо барих</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Холбогдох мэдээллээ оруулна уу.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Inp label="И-мэйл *" value={contact.email} onChange={function(v) { upd(setContact, "email", v); }} placeholder="badrakh@email.com" type="email" />
                    <Inp label="Утас *" value={contact.phone} onChange={function(v) { upd(setContact, "phone", v); }} placeholder="88395886" />
                    <Inp label="Утас 2" value={contact.phone2} onChange={function(v) { upd(setContact, "phone2", v); }} placeholder="96113376" />
                    <Inp label="Хаяг" value={contact.address} onChange={function(v) { upd(setContact, "address", v); }} placeholder="Улаанбаатар хот" />
                    <Inp label="LinkedIn / Facebook" value={contact.linkedin} onChange={function(v) { upd(setContact, "linkedin", v); }} placeholder="ganbaatar.badrah" cls="col-span-2" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Боловсрол</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Боловсролын мэдээллээ оруулна уу.</p>
                  {educations.map(function(edu, i) { return <EduForm key={i} edu={edu} index={i} canRemove={educations.length > 1} onRemove={function() { setEducations(removeAt(educations, i)); }} onUpdate={function(field, val) { updList(educations, setEducations, i, field, val); }} />; })}
                  <button type="button" onClick={function() { setEducations(educations.concat([{ level: "", school: "", major: "", major_field: "", gpa: "", start_year: "", end_year: "", currently: false }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Боловсрол нэмэх</button>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Ажлын туршлага</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Байхгүй бол алгасаж болно.</p>
                  {experiences.map(function(exp, i) { return <ExpForm key={i} exp={exp} index={i} canRemove={experiences.length > 1} onRemove={function() { setExperiences(removeAt(experiences, i)); }} onUpdate={function(field, val) { updList(experiences, setExperiences, i, field, val); }} />; })}
                  <button type="button" onClick={function() { setExperiences(experiences.concat([{ category: "", position: "", company: "", description: "", start_date: "", end_date: "", currently: false }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Туршлага нэмэх</button>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Хувийн ур чадвар, Компьютер</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Товч дарж сонгоно уу.</p>
                  <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700"><p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Хувийн ур чадвар <span className="text-gray-400 dark:text-gray-500 font-normal">({selectedPersonal.length})</span></p><SkillToggle items={personalSkills} selected={selectedPersonal} onToggle={function(s) { toggleSkill(selectedPersonal, setSelectedPersonal, s); }} /></div>
                  <div><p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Компьютерын програм <span className="text-gray-400 dark:text-gray-500 font-normal">({selectedTech.length})</span></p><SkillToggle items={techSkills} selected={selectedTech} onToggle={function(s) { toggleSkill(selectedTech, setSelectedTech, s); }} /></div>
                </div>
              )}

              {step === 7 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Мэргэжлийн, урлаг, спорт</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Товч дарж сонгоно уу.</p>
                  <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700"><p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Мэргэжлийн ур чадвар <span className="text-gray-400 dark:text-gray-500 font-normal">({selectedProf.length})</span></p><SkillToggle items={profSkills} selected={selectedProf} onToggle={function(s) { toggleSkill(selectedProf, setSelectedProf, s); }} /></div>
                  <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700"><p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Урлагийн ур чадвар <span className="text-gray-400 dark:text-gray-500 font-normal">({selectedArt.length})</span></p><SkillToggle items={artSkills} selected={selectedArt} onToggle={function(s) { toggleSkill(selectedArt, setSelectedArt, s); }} /></div>
                  <div><p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Спортын ур чадвар <span className="text-gray-400 dark:text-gray-500 font-normal">({selectedSport.length})</span></p><SkillToggle items={sportSkills} selected={selectedSport} onToggle={function(s) { toggleSkill(selectedSport, setSelectedSport, s); }} /></div>
                </div>
              )}

              {step === 8 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Гадаад хэлний мэдлэг</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Мэддэг хэлээ нэмнэ үү.</p>
                  {langList.map(function(l, i) { return <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"><Sel label="Хэл" value={l.name} onChange={function(v) { updList(langList, setLangList, i, "name", v); }} options={languageOptions} /><div className="flex items-end gap-2"><Sel label="Түвшин" value={l.level} onChange={function(v) { updList(langList, setLangList, i, "level", v); }} options={levelOptions} cls="flex-1" />{langList.length > 1 && <button type="button" onClick={function() { setLangList(removeAt(langList, i)); }} className="text-red-600 text-xs font-medium pb-3 px-2 flex-shrink-0">Устгах</button>}</div></div>; })}
                  <button type="button" onClick={function() { setLangList(langList.concat([{ name: "", level: "" }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Хэл нэмэх</button>
                </div>
              )}

              {step === 9 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Сургалт, сертификат</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Хамрагдсан сургалтаа нэмнэ үү.</p>
                  {certs.map(function(c, i) {
                    return (
                      <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 mb-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-600"><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Сургалт #{i + 1}</span>{certs.length > 1 && <button type="button" onClick={function() { setCerts(removeAt(certs, i)); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Устгах</button>}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Inp label="Сургалтын нэр *" value={c.name} onChange={function(v) { updList(certs, setCerts, i, "name", v); }} placeholder="Web Development" />
                          <Inp label="Сургалтын дэлгэрэнгүй *" value={c.organization} onChange={function(v) { updList(certs, setCerts, i, "organization", v); }} placeholder="Pinecone" />
                          <Inp label="Эхэлсэн" value={c.start_date} onChange={function(v) { updList(certs, setCerts, i, "start_date", v); }} type="date" />
                          <Inp label="Дууссан" value={c.end_date} onChange={function(v) { updList(certs, setCerts, i, "end_date", v); }} type="date" />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Гэрчилгээний файл <span className="text-gray-400 dark:text-gray-500 font-normal">(PDF, JPG, PNG — 10MB хүртэл)</span></label>
                          {c.file_url ? (
                            <div className="flex items-center gap-3"><a href={c.file_url} target="_blank" rel="noreferrer" className="text-sm text-violet-600 font-medium hover:underline">Хуулагдсан файл харах</a><button type="button" onClick={function() { updList(certs, setCerts, i, "file_url", ""); }} className="text-xs text-red-500 hover:text-red-700">Устгах</button></div>
                          ) : (
                            <label className="inline-flex items-center gap-2 cursor-pointer"><span className={"px-4 py-2 text-sm rounded-xl border font-medium transition " + (certUploading[i] ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-500 cursor-not-allowed" : "bg-white dark:bg-gray-700 border-violet-400 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20")}>{certUploading[i] ? "Хуулж байна..." : "+ Файл хавсаргах"}</span><input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" disabled={!!certUploading[i]} onChange={function(e) { if (e.target.files[0]) uploadCertFile(i, e.target.files[0]); e.target.value = ""; }} /></label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" onClick={function() { setCerts(certs.concat([{ name: "", organization: "", start_date: "", end_date: "", file_url: "" }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Сургалт нэмэх</button>
                </div>
              )}

              {step === 10 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Дадлага</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Байхгүй бол алгасаж болно.</p>
                  {interns.map(function(n, i) {
                    return (
                      <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 mb-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-600"><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Дадлага #{i + 1}</span>{interns.length > 1 && <button type="button" onClick={function() { setInterns(removeAt(interns, i)); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Устгах</button>}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Inp label="Байгууллага *" value={n.company} onChange={function(v) { updList(interns, setInterns, i, "company", v); }} placeholder="Компани" />
                          <Inp label="Дадлагын нэр *" value={n.title} onChange={function(v) { updList(interns, setInterns, i, "title", v); }} placeholder="Frontend дадлагажигч" />
                          <Inp label="Эхэлсэн" value={n.start_date} onChange={function(v) { updList(interns, setInterns, i, "start_date", v); }} type="date" />
                          <Inp label="Дууссан" value={n.end_date} onChange={function(v) { updList(interns, setInterns, i, "end_date", v); }} type="date" />
                          <div className="col-span-2"><label className={labelCls}>Хийсэн ажил</label><textarea defaultValue={n.description} onBlur={function(e) { updList(interns, setInterns, i, "description", e.target.value); }} placeholder="Хийсэн ажлууд..." rows={2} className={inputCls} /></div>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" onClick={function() { setInterns(interns.concat([{ company: "", title: "", description: "", start_date: "", end_date: "" }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Дадлага нэмэх</button>
                </div>
              )}

              {step === 11 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Шагнал урамшуулал</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Авсан шагнал урамшуулалаа нэмнэ үү.</p>
                  {awards.map(function(a, i) { return <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"><Inp label="Шагнал *" value={a.name} onChange={function(v) { updList(awards, setAwards, i, "name", v); }} placeholder="2020 оны Улсын Аварга 3р байр" /><div className="flex items-end gap-2"><Inp label="Он" value={a.year} onChange={function(v) { updList(awards, setAwards, i, "year", v); }} placeholder="2020" cls="flex-1" />{awards.length > 1 && <button type="button" onClick={function() { setAwards(removeAt(awards, i)); }} className="text-red-600 text-xs font-medium pb-3 px-2 flex-shrink-0">Устгах</button>}</div></div>; })}
                  <button type="button" onClick={function() { setAwards(awards.concat([{ name: "", year: "" }])); }} className="text-sm text-violet-600 font-semibold hover:underline">+ Шагнал нэмэх</button>
                </div>
              )}

              {step === 12 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Урьдчилан харах</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Мэдээллээ шалгаад шинэчлэлтээ хадгална уу.</p>
                  {/* Mobile: use floating eye button */}
                  <div className="xl:hidden flex items-center gap-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4 text-sm text-violet-700 dark:text-violet-400 font-medium">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Доод баруун буланд байгаа нүд товч дарж CV-ийн урьдчилсан харагдацыг харна уу</span>
                  </div>
                  {/* Desktop: side panel already shows, just confirm */}
                  <div className="hidden xl:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400 font-medium">
                    <span>✓</span>
                    <span>Баруун талд CV-ийн бүтэн харагдац харагдаж байна</span>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                {step > 1 ? (
                  <button type="button" onClick={function() { setStep(step - 1); }} className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition">← Буцах</button>
                ) : (
                  <Link to={"/cv/" + cvId} className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition">Цуцлах</Link>
                )}
                {step < 12 ? (
                  <button type="button" onClick={function() { setStep(step + 1); }} className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">Дараагийн →</button>
                ) : (
                  <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 transition">{saving ? "Хадгалж байна..." : "Шинэчлэлт хадгалах"}</button>
                )}
              </div>
            </div>
          </div>

          {/* Right: live preview panel (xl+ only) — CVBuilder-тэй яг адил */}
          <div className="hidden xl:flex flex-col w-64 flex-shrink-0 sticky top-6 self-start gap-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-center">Урьдчилан харах</p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden">
              <div className="relative overflow-hidden" style={{ height: "360px" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "210mm", transform: "scale(0.322)", transformOrigin: "top left", pointerEvents: "none" }}>
                  <CVPreview cv={previewCvData} info={previewInfo} template={template} printStamp="" />
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                <button
                  type="button"
                  onClick={function () { setShowMobilePreview(true); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Preview
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile floating eye button */}
      <button
        type="button"
        onClick={function () { setShowMobilePreview(true); }}
        className="fixed bottom-6 right-6 z-40 xl:hidden w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-xl flex items-center justify-center transition"
        title="CV урьдчилан харах"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

     {/* CV preview modal */}
{showMobilePreview && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
    onClick={function () { setShowMobilePreview(false); }}
  >
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col" 
      style={{ width: "min(900px, 95vw)", maxHeight: "92vh" }} 
      onClick={function (e) { e.stopPropagation(); }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
        <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm">CV урьдчилан харах</p>
        <button 
          type="button" 
          onClick={function () { setShowMobilePreview(false); }} 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 transition text-xl"
        >×</button>
      </div>
      <div 
        className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-4" 
        ref={modalPreviewRef}
      >
        {/* ❌ Өмнөх: overflow: hidden → текст таслагддаг байсан */}
        {/* ✅ Засвар: хуурамч өндрийг хасаж, scale-д тохирсон padding-bottom нэмсэн */}
        <div style={{ 
          width: Math.round(794 * modalPreviewScale) + "px",
          paddingBottom: Math.round(1123 * modalPreviewScale) + "px",
          position: "relative",
          margin: "0 auto"
        }}>
          <div style={{ 
            width: "794px", 
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scale(" + modalPreviewScale + ")", 
            transformOrigin: "top left" 
          }}>
            <CVPreview cv={previewCvData} info={previewInfo} template={template} printStamp="" />
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
}
