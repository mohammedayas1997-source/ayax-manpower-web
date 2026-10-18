'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, candidates, employer-requests, post-job, jobs, staff
  const [lang, setLang] = useState('en'); // en, ar, fr

  // Core Data Collections
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employerRequests, setEmployerRequests] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Candidate Modal / Drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Job Posting Form State
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [regFee, setRegFee] = useState(15000);
  const [timeline, setTimeline] = useState('');
  const [processingDetails, setProcessingDetails] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [jobFeedback, setJobFeedback] = useState({ type: '', text: '' });

  // New Staff Creation Form State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('staff');
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffFeedback, setStaffFeedback] = useState({ type: '', text: '' });

  // Employer Dispatch Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Localization Dictionary
  const dict = {
    en: {
      brand: 'AYAX GLOBAL',
      subtitle: 'Executive Super Admin Operations Desk',
      overview: 'Overview & Analytics',
      candidates: 'Applicant Pipeline',
      employerRequests: 'Corporate Quota Requests',
      postJob: 'Publish Vacancy',
      jobs: 'Active Corridor Vacancies',
      staff: 'Staff & Role Management',
      signOut: 'Sign Out',
      searchPlaceholder: 'Search by full name, passport, role, or country...',
      statusAll: 'All Statuses',
      verified: 'Verified',
      pending: 'Under Review',
      deployed: 'Deployed Overseas',
      rejected: 'Audit Failed',
      printDossier: 'Print Candidate Dossier',
      sendEmail: 'Send Official Email',
      whatsapp: 'WhatsApp Desk',
      call: 'Direct Telephone',
      downloadCv: 'Download CV Document',
      viewPassport: 'Inspect Passport Data Page',
      viewPhoto: 'Passport Photograph',
      totalApplicants: 'Total Registered Talents',
      pendingVerification: 'Pending Compliance Review',
      verifiedReady: 'Verified & Deployment Ready',
      corporateQuotas: 'Corporate Quota Inquiries',
      dispatchTitle: 'Dispatch Verified Talent Roster to Employer',
      notifyEmployer: 'Send Notification to Employer',
      createStaff: 'Register New Administrative Staff',
    },
    ar: {
      brand: 'أياكس العالمية',
      subtitle: 'لوحة التحكم الإدارية والعمليات الدولية',
      overview: 'نظرة عامة والتحليلات',
      candidates: 'قاعدة بيانات المرشحين',
      employerRequests: 'طلبات الشركات وتخصيص الكوادر',
      postJob: 'نشر وظيفة شاغرة',
      jobs: 'عقود التوظيف النشطة',
      staff: 'إدارة الموظفين والصلاحيات',
      signOut: 'تسجيل الخروج',
      searchPlaceholder: 'البحث بالاسم، الجواز، التخصص أو الدولة...',
      statusAll: 'جميع الحالات',
      verified: 'تم التحقق والاعتماد',
      pending: 'قيد التدقيق والتقييم',
      deployed: 'تم الإيفاد الخارجي',
      rejected: 'مرفوض لعدم استيفاء الشروط',
      printDossier: 'طباعة ملف المرشح',
      sendEmail: 'إرسال بريد رسمي',
      whatsapp: 'واتساب مباشر',
      call: 'اتصال هاتفي',
      downloadCv: 'تحميل السيرة الذاتية',
      viewPassport: 'معاينة جواز السفر',
      viewPhoto: 'الصورة الشخصية',
      totalApplicants: 'إجمالي المتقدمين',
      pendingVerification: 'طلبات قيد المراجعة',
      verifiedReady: 'كوادر معتمدة جاهزة للإيفاد',
      corporateQuotas: 'طلبات الشركات النشطة',
      dispatchTitle: 'إرسال قائمة الكوادر المختارة للشركة',
      notifyEmployer: 'إشعار جهة العمل بالمرشحين المعتمدين',
      createStaff: 'تسجيل موظف إداري جديد',
    },
    fr: {
      brand: 'AYAX GLOBAL',
      subtitle: 'Console Opérationnelle de Super Administration',
      overview: 'Vue Globale et Analyses',
      candidates: 'Vivier des Candidats',
      employerRequests: 'Demandes de Quotas Entreprises',
      postJob: 'Publier une Offre',
      jobs: 'Postes Actifs en Corridors',
      staff: 'Gestion du Personnel et Rôles',
      signOut: 'Déconnexion',
      searchPlaceholder: 'Rechercher par nom, passeport, métier ou pays...',
      statusAll: 'Tous les statuts',
      verified: 'Vérifié & Conforme',
      pending: 'En Cours d’Audit',
      deployed: 'Déployé à l’Étranger',
      rejected: 'Non Conforme',
      printDossier: 'Imprimer Dossier Candidat',
      sendEmail: 'Envoyer Email Officiel',
      whatsapp: 'Contact WhatsApp',
      call: 'Appel Téléphonique',
      downloadCv: 'Télécharger le CV',
      viewPassport: 'Consulter Page Passeport',
      viewPhoto: 'Photo d’Identité',
      totalApplicants: 'Total Candidats Enregistrés',
      pendingVerification: 'En Attente de Vérification',
      verifiedReady: 'Certifiés Prêts au Déploiement',
      corporateQuotas: 'Demandes Entreprises Reçues',
      dispatchTitle: 'Transmettre la Sélection à l’Employeur',
      notifyEmployer: 'Notifier l’Employeur des Profils Retenus',
      createStaff: 'Ajouter un Collaborateur Staff',
    }
  };

  const t = dict[lang] || dict.en;

  useEffect(() => {
    checkAdminAuthAndLoad();
  }, []);

  const checkAdminAuthAndLoad = async () => {
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

      if (!userRole) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (userData?.role) userRole = userData.role;
      }

      const normalizedRole = (userRole || '').toLowerCase();
      if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin' && normalizedRole !== 'staff') {
        alert('Access Denied: Admins & Staff only.');
        router.push('/login');
        return;
      }

      await loadDashboardData();
    } catch (err) {
      console.error('Authentication Error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // 1. Fetch Candidates
      const { data: candidateData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .neq('role', 'admin')
        .order('id', { ascending: false });

      if (candidateData) setCandidates(candidateData);

      // 2. Fetch Jobs
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobData) setJobs(jobData);

      // 3. Mock or Fetch Employer Quota Requests
      const mockRequests = [
        {
          id: 'REQ-101',
          company_name: 'Al-Bawani Logistics Group Ltd',
          country: 'Saudi Arabia',
          trade_requested: 'Heavy Commercial Transport Drivers',
          quota_number: 25,
          contact_email: 'procurement@albawanigroup.sa',
          phone: '+966 50 123 4567',
          status: 'Pending Audit',
          created_at: '2026-10-15',
        },
        {
          id: 'REQ-102',
          company_name: 'Apex Healthcare Services UK',
          country: 'United Kingdom',
          trade_requested: 'Healthcare & Clinical Support Assistants',
          quota_number: 10,
          contact_email: 'talent@apexhealthcare.co.uk',
          phone: '+44 20 7946 0912',
          status: 'Under Verification',
          created_at: '2026-10-16',
        },
        {
          id: 'REQ-103',
          company_name: 'Gulf PetroTech Engineering',
          country: 'United Arab Emirates',
          trade_requested: '6G Certified Pipe Welders & Fabricators',
          quota_number: 15,
          contact_email: 'recruitment@gulfpetrotech.ae',
          phone: '+971 4 234 5678',
          status: 'Approved Roster Dispatched',
          created_at: '2026-10-17',
        }
      ];
      setEmployerRequests(mockRequests);

      // 4. Load Staff Accounts
      const { data: staffData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .or('role.eq.staff,role.eq.admin,role.eq.superadmin');

      if (staffData) setStaffMembers(staffData);

    } catch (err) {
      console.error('Data Loading Notice:', err);
    }
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({ verification_status: newStatus })
        .eq('id', candidateId);

      if (error) throw error;
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, verification_status: newStatus } : c))
      );
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate((prev) => ({ ...prev, verification_status: newStatus }));
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    setJobFeedback({ type: '', text: '' });

    try {
      const { error } = await supabase.from('jobs').insert([
        {
          title: jobTitle,
          country,
          salary_range: salaryRange,
          registration_fee: Number(regFee),
          timeline,
          processing_details: processingDetails,
          is_active: true,
        },
      ]);

      if (error) throw error;
      setJobFeedback({ type: 'success', text: 'New international vacancy published successfully!' });
      setJobTitle('');
      setCountry('');
      setSalaryRange('');
      setTimeline('');
      setProcessingDetails('');
      loadDashboardData();
    } catch (err) {
      setJobFeedback({ type: 'error', text: err.message || 'Error publishing vacancy' });
    } finally {
      setPostingJob(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreatingStaff(true);
    setStaffFeedback({ type: '', text: '' });

    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          data: {
            full_name: staffName,
            role: staffRole,
          }
        }
      });

      if (authErr) throw authErr;

      if (authData?.user) {
        await supabase.from('candidate_profiles').upsert([
          {
            id: authData.user.id,
            full_name: staffName,
            role: staffRole,
            verification_status: 'verified',
          }
        ]);
      }

      setStaffFeedback({ type: 'success', text: `Staff user account for ${staffName} created successfully!` });
      setStaffEmail('');
      setStaffPassword('');
      setStaffName('');
      loadDashboardData();
    } catch (err) {
      setStaffFeedback({ type: 'error', text: err.message || 'Error generating staff credentials' });
    } finally {
      setCreatingStaff(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const openDispatchModal = (request) => {
    setSelectedRequest(request);
    setDispatchSuccess(false);
    setSelectedCandidateIds([]);
    setDispatchMessage(
      `Dear ${request.company_name} Technical HR,\n\nAYAX Global Manpower has completed credential and trade compliance verification for your requested quota (${request.quota_number} Positions - ${request.trade_requested}).\n\nThe most qualified and certified personnel have been selected based on trade exam scores and international biometric clearance.\n\nPlease find the attached official deployment roster.\n\nBest regards,\nAYAX Global Operations Bureau`
    );
  };

  const handleSendDispatch = () => {
    setDispatchSuccess(true);
    setTimeout(() => {
      setSelectedRequest(null);
      setDispatchSuccess(false);
    }, 2500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredCandidates = candidates.filter((cand) => {
    const matchesFilter =
      statusFilter === 'all' || (cand.verification_status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (cand.full_name || '').toLowerCase().includes(query) ||
      (cand.passport_number || '').toLowerCase().includes(query) ||
      (cand.role || '').toLowerCase().includes(query) ||
      (cand.target_country || '').toLowerCase().includes(query) ||
      (cand.email || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-300">Initializing AYAX Global Enterprise Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      {/* 1. Global Side Navigation Bar */}
      <aside className="w-64 bg-[#071626] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none print:hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <img src="/logo.png" alt="AYAX Global" className="h-9 w-auto bg-white p-1 rounded-md" />
            <div>
              <span className="text-sm font-black tracking-wider text-white block leading-tight">{t.brand}</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Executive Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>📊</span>
              <span>{t.overview}</span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'candidates'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>👥</span>
                <span>{t.candidates}</span>
              </div>
              <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('employer-requests')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'employer-requests'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>🏢</span>
                <span>{t.employerRequests}</span>
              </div>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {employerRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('post-job')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'post-job'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>➕</span>
              <span>{t.postJob}</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>🌐</span>
                <span>{t.jobs}</span>
              </div>
              <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🛡️</span>
              <span>{t.staff}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl text-xs">
            <span className="text-slate-400 font-semibold">Language</span>
            <div className="flex gap-1 font-bold">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-2 py-1 rounded ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded ${lang === 'fr' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                FR
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition"
          >
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* 2. Main Executive Work Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#091e32] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Visit Portal Website</span>
              <span>↗</span>
            </a>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">{t.totalApplicants}</span>
                  <div className="text-3xl font-extrabold text-white mt-2">{candidates.length}</div>
                  <span className="text-xs text-sky-400 font-semibold mt-1 inline-block">Registered in Global Talent Pool</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider block">{t.pendingVerification}</span>
                  <div className="text-3xl font-extrabold text-amber-400 mt-2">
                    {candidates.filter((c) => !c.verification_status || c.verification_status === 'pending').length}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 inline-block">Awaiting Document Clearance</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider block">{t.verifiedReady}</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                    {candidates.filter((c) => c.verification_status === 'verified').length}
                  </div>
                  <span className="text-xs text-emerald-400/80 font-semibold mt-1 inline-block">Ready for Employer Quota Dispatch</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider block">{t.corporateQuotas}</span>
                  <div className="text-3xl font-extrabold text-sky-400 mt-2">{employerRequests.length}</div>
                  <span className="text-xs text-slate-400 mt-1 inline-block">Active Corridors: KSA, UAE, UK, EU</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-3">Recent Corporate Demands</h3>
                  <div className="space-y-3">
                    {employerRequests.map((req) => (
                      <div key={req.id} className="bg-slate-900/80 border border-slate-700/60 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{req.company_name}</div>
                          <div className="text-[11px] text-sky-400 font-semibold">{req.trade_requested} &bull; {req.country}</div>
                        </div>
                        <button
                          onClick={() => openDispatchModal(req)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition"
                        >
                          Dispatch Candidates
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-3">Super Admin Operational Guidelines</h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Audit all passport copies against national biometric criteria before granting <strong>Verified</strong> status.</li>
                    <li>Forward candidate dossiers directly to verified employer representatives using the corporate dispatch module.</li>
                    <li>Registration & auditing fees must be confirmed via Paystack before deploying credentials.</li>
                    <li>Use the print dossier feature for physical consular interview binders in Kano.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATES AUDITING & PIPELINE */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              {/* Controls Strip */}
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-80 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t.statusAll}</option>
                    <option value="pending">{t.pending}</option>
                    <option value="verified">{t.verified}</option>
                    <option value="deployed">{t.deployed}</option>
                    <option value="rejected">{t.rejected}</option>
                  </select>
                </div>

                <button
                  onClick={handlePrintDossier}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>{t.printDossier}</span>
                </button>
              </div>

              {/* Candidates Table */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Applicant Profile</th>
                        <th className="p-4">Passport & Credentials</th>
                        <th className="p-4">Trade & Target Country</th>
                        <th className="p-4">Uploaded Files</th>
                        <th className="p-4">Compliance Status</th>
                        <th className="p-4 text-right">Action Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No candidate dossiers matching your search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((cand) => (
                          <tr key={cand.id} className="hover:bg-slate-700/40 transition">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{cand.full_name || 'Unregistered Full Name'}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{cand.email || 'Email not provided'}</div>
                              <div className="text-[11px] text-sky-400 font-mono mt-0.5">{cand.phone || '+234 ---'}</div>
                            </td>

                            <td className="p-4 font-mono font-medium text-slate-300">
                              {cand.passport_number ? (
                                <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                                  {cand.passport_number}
                                </span>
                              ) : (
                                <span className="text-slate-500">No Passport Recorded</span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{cand.desired_role || cand.role || 'Skilled Trades'}</div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Destination: <strong>{cand.target_country || 'Saudi Arabia / UAE'}</strong>
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-1 text-[11px]">
                                {cand.cv_url ? (
                                  <a href={cand.cv_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    📄 {t.downloadCv}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">CV: Not Uploaded</span>
                                )}

                                {cand.passport_data_page_url ? (
                                  <a href={cand.passport_data_page_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    🛂 {t.viewPassport}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">Data Page: Missing</span>
                                )}

                                {cand.passport_photo_url ? (
                                  <a href={cand.passport_photo_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    🖼️ {t.viewPhoto}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">Photo: Missing</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  cand.verification_status === 'verified'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : cand.verification_status === 'deployed'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : cand.verification_status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {cand.verification_status || 'Under Review'}
                              </span>
                            </td>

                            <td className="p-4 text-right space-x-2">
                              {/* Direct Communication Protocol */}
                              <div className="inline-flex gap-1.5 mr-2">
                                {cand.email && (
                                  <a
                                    href={`mailto:${cand.email}?subject=AYAX Global Recruitment Update - Biometric Verification&body=Dear ${encodeURIComponent(cand.full_name || 'Candidate')},\n\nThis is an official communication regarding your overseas employment verification dossier.\n\nRegards,\nAYAX Global Operations`}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                                    title="Send Official Email"
                                  >
                                    ✉️
                                  </a>
                                )}
                                {cand.phone && (
                                  <a
                                    href={`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 rounded-lg text-emerald-300 hover:text-white transition"
                                    title="Open WhatsApp Desk"
                                  >
                                    💬
                                  </a>
                                )}
                              </div>

                              <select
                                value={cand.verification_status || 'pending'}
                                onChange={(e) => handleUpdateStatus(cand.id, e.target.value)}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pending">Under Review</option>
                                <option value="verified">Verified (Approved)</option>
                                <option value="deployed">Deployed Overseas</option>
                                <option value="rejected">Rejected (Non-compliant)</option>
                              </select>
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

          {/* TAB 3: CORPORATE EMPLOYER QUOTA REQUESTS */}
          {activeTab === 'employer-requests' && (
            <div className="space-y-6">
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Corporate Recruitment Quota Requisitions</h3>
                    <p className="text-xs text-slate-400 mt-1">Review verified international employer requests and forward audited candidate pools.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employerRequests.map((req) => (
                    <div key={req.id} className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-400 px-2.5 py-1 rounded-md border border-blue-500/30">
                            {req.country}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                        </div>

                        <h4 className="font-extrabold text-white text-base leading-snug">{req.company_name}</h4>
                        <p className="text-xs font-semibold text-slate-300 mt-2">Specialization: {req.trade_requested}</p>
                        <div className="mt-4 p-3 bg-slate-800/80 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Approved Quota:</span>
                            <strong className="text-white">{req.quota_number} Workforce Slots</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Employer Contact:</span>
                            <span className="text-sky-400">{req.contact_email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {req.status}
                        </span>
                        <button
                          onClick={() => openDispatchModal(req)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-sm"
                        >
                          Dispatch Candidates &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISH JOB VACANCIES */}
          {activeTab === 'post-job' && (
            <div className="max-w-3xl mx-auto bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl">
              <h3 className="text-lg font-black text-white mb-1">Publish New Overseas Employment Vacancy</h3>
              <p className="text-xs text-slate-400 mb-6">Published contracts become visible on candidate portals and public listings.</p>

              {jobFeedback.text && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold mb-6 ${
                    jobFeedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {jobFeedback.text}
                </div>
              )}

              <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Certified Heavy Fleet Transport Specialist"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Destination Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Saudi Arabia, UAE, United Kingdom"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Estimated Salary Package *</label>
                    <input
                      type="text"
                      required
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="e.g. 2,800 - 3,500 SAR / Month + Lodging"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Auditing & Registration Fee (₦) *</label>
                    <input
                      type="number"
                      required
                      value={regFee}
                      onChange={(e) => setRegFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Mobilization Timeline *</label>
                    <input
                      type="text"
                      required
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. 60 - 90 Days from Medical Clearance"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Contract Specifications & Quota Terms</label>
                  <textarea
                    rows="4"
                    value={processingDetails}
                    onChange={(e) => setProcessingDetails(e.target.value)}
                    placeholder="Specify flight itinerary details, corporate lodging provisions, GAMCA medicals, and consular submission protocols..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={postingJob}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg disabled:bg-slate-700"
                >
                  {postingJob ? 'Registering Vacancy...' : 'Publish Official Vacancy to Portal'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ACTIVE VACANCIES */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between shadow-md">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-400 px-2 py-0.5 rounded">
                          {job.country}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{job.timeline}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-base leading-snug">{job.title}</h4>
                      <div className="mt-3 text-xs space-y-1 text-slate-300">
                        <div>Salary: <strong className="text-white">{job.salary_range}</strong></div>
                        <div>Registration Fee: <strong className="text-white">₦{Number(job.registration_fee || 15000).toLocaleString()}</strong></div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active on Platform
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STAFF USER CREATION & RBAC */}
          {activeTab === 'staff' && (
            <div className="space-y-8">
              <div className="max-w-2xl bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold text-white mb-1">Create Administrative Officer / Auditor Account</h3>
                <p className="text-xs text-slate-400 mb-6">Authorize internal staff members to conduct document reviews and candidate audits.</p>

                {staffFeedback.text && (
                  <div
                    className={`p-4 rounded-xl text-xs font-semibold mb-6 ${
                      staffFeedback.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {staffFeedback.text}
                  </div>
                )}

                <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Ibrahim Abubakar (Verification Desk Officer)"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Corporate Email *</label>
                      <input
                        type="email"
                        required
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="staff@ayaxglobal.com"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Assigned Security Role *</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      >
                        <option value="staff">Staff (Auditor & Document Reviewer)</option>
                        <option value="admin">Super Admin (Full Platform Control)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingStaff}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:bg-slate-700"
                  >
                    {creatingStaff ? 'Creating Staff Member...' : 'Register Authorized Staff Member'}
                  </button>
                </form>
              </div>

              {/* Existing Staff Roster */}
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4">Authorized Administrative Personnel</h4>
                <div className="divide-y divide-slate-700/60 text-xs">
                  {staffMembers.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{member.full_name || 'Staff Member'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{member.id}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-400 border border-blue-500/30">
                        {member.role || 'Staff'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. DISPATCH MODAL FOR CORPORATE NOTIFICATIONS */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a2540] border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-white">{t.dispatchTitle}</h3>
                <span className="text-[11px] text-sky-400 font-semibold">{selectedRequest.company_name} ({selectedRequest.country})</span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="text-4xl">✅</div>
                <h4 className="text-base font-bold text-emerald-400">Roster Successfully Dispatched!</h4>
                <p className="text-slate-300 text-xs">
                  Official notification and candidate trade evaluation report forwarded to {selectedRequest.contact_email}.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Corporate Dispatch Transmission Message</label>
                  <textarea
                    rows="6"
                    value={dispatchMessage}
                    onChange={(e) => setDispatchMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Available Verified Candidates</span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {candidates
                      .filter((c) => c.verification_status === 'verified')
                      .map((c) => (
                        <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                          <span className="font-semibold text-white">{c.full_name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({c.passport_number || 'Passport Audited'})</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDispatch}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg"
                  >
                    Confirm & Send Notification to Employer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}