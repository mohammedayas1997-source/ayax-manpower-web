'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function EmployerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en'); // en, ar, fr, de, es, zh, ru
  const [activeTab, setActiveTab] = useState('demands'); // demands, new-demand, talent-pool, company-profile

  const [companyProfile, setCompanyProfile] = useState(null);
  const [myDemands, setMyDemands] = useState([]);
  const [verifiedTalents, setVerifiedTalents] = useState([]);
  const [searchTalent, setSearchTalent] = useState('');

  // New Demand Form State
  const [jobCategory, setJobCategory] = useState('');
  const [quotaNeeded, setQuotaNeeded] = useState(10);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Multi-Language Dictionary
  const translations = {
    en: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Employer Workforce Portal',
      demandsTab: 'Active Quota Demands',
      newDemandTab: '+ Request Workforce Quota',
      talentPoolTab: 'Audited Talent Pool',
      companyTab: 'Corporate Profile',
      signOut: 'Sign Out',
      welcome: 'Welcome, Corporate Partner',
      activeDemandsHeader: 'Submitted Quota Demands & Mobilization Pipeline',
      noDemands: 'No active quota requisitions found. Click "+ Request Workforce Quota" to mobilize personnel.',
      jobCategory: 'Trade / Job Category',
      quotaCount: 'Required Quota',
      deploymentCountry: 'Deployment Country',
      salaryPackage: 'Offered Compensation',
      pipelineStatus: 'Mobilization Status',
      submitTitle: 'Submit Workforce Quota Requisition',
      submitSubtitle: 'Submit trade requirements, contract duration, and volume to our mobilization desk.',
      reqTrade: 'Workforce Trade / Specialization *',
      reqVolume: 'Required Headcount (Quota) *',
      reqCountry: 'Deployment Destination *',
      reqSalary: 'Offered Monthly Salary & Benefits *',
      reqNotes: 'Job Specifications & Certifications (e.g., GAMCA, Trade test)',
      btnSubmit: 'Submit Requisition to Operations',
      btnSubmitting: 'Submitting Requisition...',
      searchTalents: 'Filter verified candidates by trade, passport, or name...',
      verifiedCandidate: 'Verified & Cleared',
      downloadCv: 'Review CV & Credentials',
      selectCandidate: 'Select Candidate for Deployment',
      selectedSuccess: 'Candidate earmarked for mobilization. AYAX liaison notified.',
      hqAddress: 'Corporate Registered Address',
      contactPerson: 'Lead Representative',
      commercialRc: 'Commercial Registration (CR / RC)',
      saveProfile: 'Save Corporate Dossier',
    },
    ar: {
      brand: 'أياكس العالمية',
      portalTitle: 'بوابة الشركات واستقطاب الكوادر',
      demandsTab: 'الطلبات النشطة للكوادر',
      newDemandTab: '+ طلب حصة عمالية جديدة',
      talentPoolTab: 'قاعدة الكوادر المعتمدة',
      companyTab: 'الملف المؤسسي',
      signOut: 'تسجيل الخروج',
      welcome: 'مرحباً بالشريك المؤسسي',
      activeDemandsHeader: 'طلبات التوظيف ومتابعة إجراءات الإيفاد',
      noDemands: 'لا توجد طلبات نشطة حالياً. انقر على "+ طلب حصة عمالية جديدة" للبدء.',
      jobCategory: 'التخصص المهني',
      quotaCount: 'العدد المطلوب',
      deploymentCountry: 'بلد الاستقدام',
      salaryPackage: 'الراتب والمزايا',
      pipelineStatus: 'حالة الطلب',
      submitTitle: 'تقديم طلب استقدام عمالة معتمدة',
      submitSubtitle: 'حدد التخصصات المهنية والعدد والرواتب لإحالتها لفريق العمليات.',
      reqTrade: 'التخصص أو المهنة المطلوبة *',
      reqVolume: 'العدد المطلوب (الكوادر) *',
      reqCountry: 'دولة وموقع العمل *',
      reqSalary: 'الراتب الشهري والبدلات *',
      reqNotes: 'المعايير الخاصة والشهادات (فحص جامكا، اختبارات مهنية)',
      btnSubmit: 'إرسال الطلب لغرفة العمليات',
      btnSubmitting: 'جارٍ إرسال الطلب...',
      searchTalents: 'ابحث بالاسم أو التخصص أو رقم الجواز...',
      verifiedCandidate: 'معتمد وجاهز للإيفاد',
      downloadCv: 'معاينة السيرة الذاتية',
      selectCandidate: 'اختيار هذا المرشح للتعاقد',
      selectedSuccess: 'تم تحديد المرشح وإشعار مكتب أياكس للمتابعة.',
      hqAddress: 'العنوان المسجل للمقر الرئيسي',
      contactPerson: 'الممثل المعتمد',
      commercialRc: 'رقم السجل التجاري',
      saveProfile: 'حفظ بيانات الشركة',
    },
    fr: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Portail Employeurs et Recrutement',
      demandsTab: 'Demandes Actives',
      newDemandTab: '+ Demander un Quota',
      talentPoolTab: 'Vivier de Talents Vérifiés',
      companyTab: 'Profil d’Entreprise',
      signOut: 'Déconnexion',
      welcome: 'Bienvenue, Partenaire Entreprise',
      activeDemandsHeader: 'Demandes de Quotas et Suivi de Déploiement',
      noDemands: 'Aucune demande active trouvée. Cliquez sur "+ Demander un Quota".',
      jobCategory: 'Métier / Spécialité',
      quotaCount: 'Effectif Requis',
      deploymentCountry: 'Pays de Déploiement',
      salaryPackage: 'Rémunération Proposée',
      pipelineStatus: 'Statut du Dossier',
      submitTitle: 'Soumettre une Demande de Quota',
      submitSubtitle: 'Spécifiez les compétences, les effectifs et la rémunération.',
      reqTrade: 'Corps de Métier *',
      reqVolume: 'Nombre de Postes Requis *',
      reqCountry: 'Destination de Travail *',
      reqSalary: 'Salaire Mensuel et Avantages *',
      reqNotes: 'Critères Spécifiques et Certifications',
      btnSubmit: 'Soumettre la Demande',
      btnSubmitting: 'Envoi en cours...',
      searchTalents: 'Filtrer par nom, métier ou passeport...',
      verifiedCandidate: 'Vérifié & Conforme',
      downloadCv: 'Consulter le CV',
      selectCandidate: 'Retenir ce Candidat',
      selectedSuccess: 'Candidat sélectionné avec succès.',
      hqAddress: 'Siège Social Enregistré',
      contactPerson: 'Représentant Officiel',
      commercialRc: 'Numéro d’Immatriculation / Registre',
      saveProfile: 'Enregistrer le Profil',
    },
    de: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Arbeitgeber-Portal',
      demandsTab: 'Aktive Kontingente',
      newDemandTab: '+ Fachkräfte anfordern',
      talentPoolTab: 'Geprüfter Talent-Pool',
      companyTab: 'Unternehmensprofil',
      signOut: 'Abmelden',
      welcome: 'Willkommen, Unternehmenspartner',
      activeDemandsHeader: 'Eingereichte Personalanforderungen & Pipeline',
      noDemands: 'Keine aktiven Anforderungen vorhanden.',
      jobCategory: 'Berufsfeld / Gewerk',
      quotaCount: 'Bedarf (Anzahl)',
      deploymentCountry: 'Einsatzland',
      salaryPackage: 'Gehaltsangebot',
      pipelineStatus: 'Status',
      submitTitle: 'Personalanforderung einreichen',
      submitSubtitle: 'Spezifizieren Sie Qualifikationen und Volumen.',
      reqTrade: 'Fachbereich / Beruf *',
      reqVolume: 'Benötigte Fachkräfte *',
      reqCountry: 'Zielland *',
      reqSalary: 'Monatsgehalt & Zusatzleistungen *',
      reqNotes: 'Anforderungen & Zertifikate',
      btnSubmit: 'Anforderung absenden',
      btnSubmitting: 'Wird übermittelt...',
      searchTalents: 'Nach Name, Gewerk oder Pass filtern...',
      verifiedCandidate: 'Geprüft & Freigegeben',
      downloadCv: 'Lebenslauf prüfen',
      selectCandidate: 'Kandidat auswählen',
      selectedSuccess: 'Kandidat erfolgreich vermerkt.',
      hqAddress: 'Firmensitz / Adresse',
      contactPerson: 'Ansprechpartner',
      commercialRc: 'Handelsregisternummer',
      saveProfile: 'Profil speichern',
    },
    es: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Portal de Empresas y Empleadores',
      demandsTab: 'Cuotas Activas',
      newDemandTab: '+ Solicitar Personal',
      talentPoolTab: 'Candidatos Verificados',
      companyTab: 'Perfil Corporativo',
      signOut: 'Cerrar Sesión',
      welcome: 'Bienvenido, Socio Corporativo',
      activeDemandsHeader: 'Solicitudes de Personal y Despliegue',
      noDemands: 'No hay solicitudes activas actualmente.',
      jobCategory: 'Categoría Profesional',
      quotaCount: 'Personal Requerido',
      deploymentCountry: 'País de Destino',
      salaryPackage: 'Remuneración Ofrecida',
      pipelineStatus: 'Estado del Proceso',
      submitTitle: 'Enviar Solicitud de Cuota de Personal',
      submitSubtitle: 'Indique las especificaciones técnicas y vacantes.',
      reqTrade: 'Especialidad / Puesto *',
      reqVolume: 'Vacantes Requeridas *',
      reqCountry: 'País de Destino *',
      reqSalary: 'Salario Mensual Ofrecido *',
      reqNotes: 'Requisitos y Certificaciones',
      btnSubmit: 'Enviar a Operaciones',
      btnSubmitting: 'Enviando...',
      searchTalents: 'Buscar por nombre, especialidad o pasaporte...',
      verifiedCandidate: 'Verificado y Aprobado',
      downloadCv: 'Ver Currículum Vitae',
      selectCandidate: 'Seleccionar Candidato',
      selectedSuccess: 'Candidato seleccionado con éxito.',
      hqAddress: 'Dirección Corporativa',
      contactPerson: 'Representante Autorizado',
      commercialRc: 'Registro Mercantil (RC)',
      saveProfile: 'Guardar Perfil',
    },
    zh: {
      brand: 'AYAX GLOBAL',
      portalTitle: '全球雇主用工管理平台',
      demandsTab: '当前用工需求',
      newDemandTab: '+ 提交用工配额申请',
      talentPoolTab: '认证人才库',
      companyTab: '企业档案',
      signOut: '退出登录',
      welcome: '欢迎，企业合作伙伴',
      activeDemandsHeader: '已提交的人员配额需求与审核流',
      noDemands: '暂无用工申请。点击"+ 提交用工配额申请"开始。',
      jobCategory: '工种 / 职位类别',
      quotaCount: '所需人数',
      deploymentCountry: '用工地',
      salaryPackage: '薪酬待遇',
      pipelineStatus: '处理进度',
      submitTitle: '提交海外用工配额需求',
      submitSubtitle: '请详细填写工种、招聘人数及薪资标准。',
      reqTrade: '需求工种 / 专业 *',
      reqVolume: '需求人数 *',
      reqCountry: '工作目的地 *',
      reqSalary: '月薪及福利标准 *',
      reqNotes: '技能及体检要求 (如GAMCA等)',
      btnSubmit: '提交申请至运营中心',
      btnSubmitting: '正在提交...',
      searchTalents: '按姓名、工种或护照搜索...',
      verifiedCandidate: '已通过审核认证',
      downloadCv: '查看简历档案',
      selectCandidate: '选定录用该候选人',
      selectedSuccess: '已选定候选人，调度中心已收到通知。',
      hqAddress: '公司注册总部地址',
      contactPerson: '业务对接人',
      commercialRc: '企业商业登记号 (RC)',
      saveProfile: '保存企业信息',
    },
    ru: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Портал Международных Работодателей',
      demandsTab: 'Активные Квоты',
      newDemandTab: '+ Запросить Персонал',
      talentPoolTab: 'Верифицированные Кадры',
      companyTab: 'Профиль Компании',
      signOut: 'Выйти',
      welcome: 'Добро пожаловать, Корпоративный Партнер',
      activeDemandsHeader: 'Поданные Заявки на Подбор Персонала',
      noDemands: 'Активных заявок не найдено.',
      jobCategory: 'Специальность / Профессия',
      quotaCount: 'Требуемое Количество',
      deploymentCountry: 'Страна Назначения',
      salaryPackage: 'Предлагаемый Оклад',
      pipelineStatus: 'Статус Обработки',
      submitTitle: 'Подать Заявку на Набор Персонала',
      submitSubtitle: 'Укажите требования к кандидатам и условия контракта.',
      reqTrade: 'Специальность / Профессия *',
      reqVolume: 'Количество Работников *',
      reqCountry: 'Страна Размещения *',
      reqSalary: 'Ежемесячный Оклад и Льготы *',
      reqNotes: 'Специальные Требования и Сертификаты',
      btnSubmit: 'Отправить Заявку',
      btnSubmitting: 'Отправка...',
      searchTalents: 'Поиск по имени, профессии или паспорту...',
      verifiedCandidate: 'Верифицирован и Готов',
      downloadCv: 'Смотреть Резюме',
      selectCandidate: 'Выбрать Кандидата',
      selectedSuccess: 'Кандидат выбран. Координатор уведомлен.',
      hqAddress: 'Юридический Адрес Штаб-квартиры',
      contactPerson: 'Контактное Лицо',
      commercialRc: 'Регистрационный Номер Компании',
      saveProfile: 'Сохранить Профиль',
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    checkEmployerAuth();
  }, []);

  const checkEmployerAuth = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const user = session.user;
      let userRole = user?.user_metadata?.role || null;

      if (!userRole) {
        const { data: profileData } = await supabase
          .from('candidate_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.role) userRole = profileData.role;
      }

      const normalizedRole = (userRole || '').toLowerCase();
      if (normalizedRole !== 'employer' && normalizedRole !== 'company' && normalizedRole !== 'partner' && normalizedRole !== 'admin') {
        alert('Access restricted to Employer accounts.');
        router.push('/login');
        return;
      }

      const { data: empData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (empData) {
        setCompanyProfile(empData);
        setDestinationCountry(empData.country || '');
      } else {
        setCompanyProfile({
          company_name: user.user_metadata?.full_name || 'Global Enterprise Partner',
          country: 'Saudi Arabia',
          city: 'Riyadh',
          office_address: 'Al Olaya Commercial Corridor, Tower 2, Level 14',
          commercial_rc: 'CR-10492819',
          contact_person: user.email,
        });
        setDestinationCountry('Saudi Arabia');
      }

      await loadEmployerData(user.id);
    } catch (err) {
      console.error('Employer Auth Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployerData = async (employerId) => {
    try {
      const { data: demandsData } = await supabase
        .from('employer_demands')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      if (demandsData && demandsData.length > 0) {
        setMyDemands(demandsData);
      } else {
        setMyDemands([
          {
            id: 'DEM-001',
            job_category: 'Heavy Commercial Transport Drivers',
            quota_needed: 20,
            destination_country: 'Saudi Arabia',
            salary_offered: '3,000 SAR + Accommodation',
            status: 'sourcing',
          },
          {
            id: 'DEM-002',
            job_category: '6G Pipeline Welder Crew',
            quota_needed: 10,
            destination_country: 'United Arab Emirates',
            salary_offered: '3,500 AED + Overtime',
            status: 'under_review',
          }
        ]);
      }

      const { data: talentsData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('verification_status', 'verified');

      if (talentsData && talentsData.length > 0) {
        setVerifiedTalents(talentsData);
      } else {
        setVerifiedTalents([
          {
            id: 'CAN-101',
            full_name: 'Ibrahim Sani',
            role: 'Heavy Fleet Transport Driver',
            target_country: 'Saudi Arabia',
            passport_number: 'A08924182',
            city: 'Kano',
            verification_status: 'verified',
            cv_url: '#',
          },
          {
            id: 'CAN-102',
            full_name: 'Mustapha Bello',
            role: '6G Pipeline Welder & Fabricator',
            target_country: 'United Arab Emirates',
            passport_number: 'B11948291',
            city: 'Kano',
            verification_status: 'verified',
            cv_url: '#',
          },
          {
            id: 'CAN-103',
            full_name: 'Fatima Zahra Abdullahi',
            role: 'Healthcare Assistant (Care Worker)',
            target_country: 'United Kingdom',
            passport_number: 'A07382910',
            city: 'Kano',
            verification_status: 'verified',
            cv_url: '#',
          }
        ]);
      }
    } catch (err) {
      console.error('Data Loading Notice:', err);
    }
  };

  const handleSubmitDemand = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const newDemand = {
        id: `DEM-${Math.floor(1000 + Math.random() * 9000)}`,
        employer_id: session?.user?.id || 'demo-employer',
        job_category: jobCategory,
        quota_needed: Number(quotaNeeded),
        destination_country: destinationCountry,
        salary_offered: salaryOffered,
        requirements: requirements,
        status: 'under_review',
      };

      await supabase.from('employer_demands').insert([newDemand]);

      setMyDemands((prev) => [newDemand, ...prev]);
      setFeedbackMsg({ type: 'success', text: 'Demand sheet submitted successfully! Operations team will review specifications.' });
      setJobCategory('');
      setQuotaNeeded(10);
      setSalaryOffered('');
      setRequirements('');
      setActiveTab('demands');
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit demand sheet.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCandidate = (candidateName) => {
    alert(`${t.selectedSuccess} (${candidateName})`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredTalents = verifiedTalents.filter((c) => {
    const q = searchTalent.toLowerCase();
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      (c.target_country || '').toLowerCase().includes(q) ||
      (c.passport_number || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-300">Loading AYAX Global Workforce Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      {/* 1. Global Enterprise Sidebar */}
      <aside className="w-64 bg-[#071626] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <img src="/logo.png" alt="AYAX Global" className="h-9 w-auto bg-white p-1 rounded-md" />
            <div>
              <span className="text-sm font-black tracking-wider text-white block leading-tight">{t.brand}</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">{t.portalTitle}</span>
            </div>
          </div>

          {/* Corporate Profile Card */}
          <div className="p-4 mx-3 my-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Enterprise Partner</span>
            <div className="font-extrabold text-white truncate mt-0.5">{companyProfile?.company_name}</div>
            <div className="text-[11px] text-sky-400 mt-0.5">{companyProfile?.country || 'International'}</div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('demands')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'demands'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>📋</span>
                <span>{t.demandsTab}</span>
              </div>
              <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                {myDemands.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('new-demand')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'new-demand'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>➕</span>
              <span>{t.newDemandTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('talent-pool')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'talent-pool'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>👷</span>
                <span>{t.talentPoolTab}</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {verifiedTalents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('company-profile')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'company-profile'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏢</span>
              <span>{t.companyTab}</span>
            </button>
          </nav>
        </div>

        {/* Global Multi-Language Switcher */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global Language</span>
            <div className="grid grid-cols-4 gap-1 font-bold text-center">
              {[
                { code: 'en', label: 'EN' },
                { code: 'ar', label: 'العربية' },
                { code: 'fr', label: 'FR' },
                { code: 'de', label: 'DE' },
                { code: 'es', label: 'ES' },
                { code: 'zh', label: '中文' },
                { code: 'ru', label: 'RU' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`py-1 rounded text-[11px] transition ${
                    lang === item.code ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition"
          >
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#091e32] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              {companyProfile?.company_name} &bull; <span className="text-sky-400">{t.portalTitle}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Main Portal Front</span>
              <span>↗</span>
            </a>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              EP
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-6 flex-1">
          
          {/* TAB 1: ACTIVE DEMANDS */}
          {activeTab === 'demands' && (
            <div className="space-y-4">
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">{t.activeDemandsHeader}</h3>
                  <button
                    onClick={() => setActiveTab('new-demand')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    {t.newDemandTab}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">{t.jobCategory}</th>
                        <th className="p-4">{t.quotaCount}</th>
                        <th className="p-4">{t.deploymentCountry}</th>
                        <th className="p-4">{t.salaryPackage}</th>
                        <th className="p-4 text-right">{t.pipelineStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {myDemands.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            {t.noDemands}
                          </td>
                        </tr>
                      ) : (
                        myDemands.map((demand) => (
                          <tr key={demand.id} className="hover:bg-slate-700/40 transition">
                            <td className="p-4 font-bold text-white">{demand.job_category}</td>
                            <td className="p-4 font-mono font-bold text-sky-400">{demand.quota_needed} Personnel</td>
                            <td className="p-4 text-slate-300">{demand.destination_country}</td>
                            <td className="p-4 text-slate-300">{demand.salary_offered || 'As per contractual terms'}</td>
                            <td className="p-4 text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  demand.status === 'fulfilled'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : demand.status === 'sourcing'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {demand.status?.replace('_', ' ') || 'Under Review'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMIT NEW DEMAND */}
          {activeTab === 'new-demand' && (
            <div className="max-w-2xl bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl mx-auto">
              <h3 className="text-base font-black text-white mb-1">{t.submitTitle}</h3>
              <p className="text-xs text-slate-400 mb-6">{t.submitSubtitle}</p>

              {feedbackMsg.text && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold mb-6 ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmitDemand} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t.reqTrade}</label>
                  <input
                    type="text"
                    required
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    placeholder="e.g. Heavy Duty Drivers, Certified Pipe Welders, Facilities Crew"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">{t.reqVolume}</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quotaNeeded}
                      onChange={(e) => setQuotaNeeded(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">{t.reqCountry}</label>
                    <input
                      type="text"
                      required
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      placeholder="e.g. Saudi Arabia, UAE, Qatar, Poland"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t.reqSalary}</label>
                  <input
                    type="text"
                    required
                    value={salaryOffered}
                    onChange={(e) => setSalaryOffered(e.target.value)}
                    placeholder="e.g. 2,800 SAR / Month + Free Accommodation & Medical"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">{t.reqNotes}</label>
                  <textarea
                    rows="3.5"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Specify required certifications (AWS, GAMCA Medicals, trade test levels)..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg disabled:bg-slate-700"
                >
                  {submitting ? t.btnSubmitting : t.btnSubmit}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AUDITED TALENT POOL */}
          {activeTab === 'talent-pool' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
                <input
                  type="text"
                  value={searchTalent}
                  onChange={(e) => setSearchTalent(e.target.value)}
                  placeholder={t.searchTalents}
                  className="w-full max-w-md px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-sky-400">
                  {filteredTalents.length} Cleared Candidates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTalents.map((talent) => (
                  <div key={talent.id} className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-blue-500/50 transition">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase">
                          ✓ {t.verifiedCandidate}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{talent.passport_number || 'Passport Audited'}</span>
                      </div>

                      <h4 className="font-extrabold text-white text-base leading-snug">{talent.full_name}</h4>
                      <p className="text-xs font-semibold text-sky-400 mt-1">{talent.role || talent.desired_role || 'Skilled Personnel'}</p>
                      
                      <div className="mt-3 p-2.5 bg-slate-900/80 rounded-xl text-xs text-slate-300 space-y-1">
                        <div>Location: <strong className="text-white">{talent.city || 'Kano'}, Nigeria</strong></div>
                        <div>Target Corridor: <strong className="text-white">{talent.target_country || 'GCC & Europe'}</strong></div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-700/80 space-y-2">
                      {talent.cv_url && (
                        <a
                          href={talent.cv_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl text-center block transition"
                        >
                          📄 {t.downloadCv}
                        </a>
                      )}
                      <button
                        onClick={() => handleSelectCandidate(talent.full_name)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl text-center block transition shadow-sm"
                      >
                        ✓ {t.selectCandidate}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE & HEADQUARTERS DOSSIER */}
          {activeTab === 'company-profile' && (
            <div className="max-w-2xl bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl mx-auto space-y-5">
              <h3 className="text-base font-black text-white">{t.companyTab}</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Company Registered Name</label>
                  <input
                    type="text"
                    disabled
                    value={companyProfile?.company_name || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">{t.commercialRc}</label>
                    <input
                      type="text"
                      disabled
                      value={companyProfile?.commercial_rc || 'CR-10492819'}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">{t.contactPerson}</label>
                    <input
                      type="text"
                      disabled
                      value={companyProfile?.contact_person || ''}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">{t.hqAddress}</label>
                  <textarea
                    rows="3"
                    disabled
                    value={companyProfile?.office_address || 'King Fahd Road, Al Olaya Commercial District, Riyadh, Saudi Arabia'}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}