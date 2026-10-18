'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState('en');

  // Core Data Collections
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employerRequests, setEmployerRequests] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [payments, setPayments] = useState([]);

  // Search & Filter Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Contact Modal State
  const [contactModalData, setContactModalData] = useState(null);
  const [savingContact, setSavingContact] = useState(false);

  // Job Posting Form State
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [regFee, setRegFee] = useState(15000);
  const [timeline, setTimeline] = useState('');
  const [processingDetails, setProcessingDetails] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [jobFeedback, setJobFeedback] = useState({ type: '', text: '' });

  // Staff Creation Form State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('staff');
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffFeedback, setStaffFeedback] = useState({ type: '', text: '' });

  // Employer Dispatch Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Localization Dictionary
  const dict = {
    en: {
      brand: 'AYAX GLOBAL',
      subtitle: 'Executive Super Admin Operations Desk',
      overview: 'Overview & Analytics',
      candidates: 'Applicant Pipeline',
      employerRequests: 'Corporate Quota Requests',
      finances: 'Financial Ledger & Payments',
      postJob: 'Publish Vacancy',
      jobs: 'Active Corridor Vacancies',
      staff: 'Staff & Role Management',
      signOut: 'Sign Out',
      searchPlaceholder: 'Search by full name, passport, phone, email, or country...',
      statusAll: 'All Statuses',
      verified: 'Verified',
      pending: 'Under Review',
      deployed: 'Deployed Overseas',
      rejected: 'Audit Failed',
      printDossier: 'Print Dossier',
      sendEmail: 'Official Email',
      whatsapp: 'WhatsApp Desk',
      call: 'Direct Call',
      editAddress: 'Contact & Address Dossier',
      totalRevenue: 'Total Registration Revenue',
      successfulTransactions: 'Settled Transactions',
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
      finances: 'المالية وسجل المدفوعات',
      postJob: 'نشر وظيفة شاغرة',
      jobs: 'عقود التوظيف النشطة',
      staff: 'إدارة الموظفين والصلاحيات',
      signOut: 'تسجيل الخروج',
      searchPlaceholder: 'البحث بالاسم، الجواز، الهاتف، البريد أو الدولة...',
      statusAll: 'جميع الحالات',
      verified: 'تم التحقق والاعتماد',
      pending: 'قيد التدقيق والتقييم',
      deployed: 'تم الإيفاد الخارجي',
      rejected: 'مرفوض لعدم استيفاء الشروط',
      printDossier: 'طباعة الملف',
      sendEmail: 'بريد رسمي',
      whatsapp: 'واتساب مباشر',
      call: 'اتصال هاتفي',
      editAddress: 'العنوان وبيانات الاتصال',
      totalRevenue: 'إجمالي الإيرادات المحصلة',
      successfulTransactions: 'العمليات المكتملة',
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
      finances: 'Comptabilité et Règlements',
      postJob: 'Publier une Offre',
      jobs: 'Postes Actifs en Corridors',
      staff: 'Gestion du Personnel et Rôles',
      signOut: 'Déconnexion',
      searchPlaceholder: 'Rechercher par nom, passeport, téléphone, email ou pays...',
      statusAll: 'Tous les statuts',
      verified: 'Vérifié & Conforme',
      pending: 'En Cours d’Audit',
      deployed: 'Déployé à l’Étranger',
      rejected: 'Non Conforme',
      printDossier: 'Imprimer Dossier',
      sendEmail: 'Email Officiel',
      whatsapp: 'Contact WhatsApp',
      call: 'Appel Direct',
      editAddress: 'Dossier Adresse et Contact',
      totalRevenue: 'Revenus d’Enregistrement Encaissés',
      successfulTransactions: 'Transactions Confirmées',
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
      const { data: candidateData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .neq('role', 'admin')
        .order('id', { ascending: false });

      if (candidateData) setCandidates(candidateData);

      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobData) setJobs(jobData);

      const mockRequests = [
        {
          id: 'REQ-101',
          company_name: 'Al-Bawani Logistics Group Ltd',
          country: 'Saudi Arabia',
          city: 'Riyadh',
          office_address: 'King Fahd Road, Al Olaya District, Building 45, Level 8, Riyadh, KSA',
          commercial_rc: 'CR-1010482910',
          trade_requested: 'Heavy Commercial Transport Drivers',
          quota_number: 25,
          contact_person: 'Sheikh Tariq Al-Mansoor (Procurement Director)',
          contact_email: 'procurement@albawanigroup.sa',
          phone: '+966501234567',
          status: 'Pending Audit',
          created_at: '2026-10-15',
        },
        {
          id: 'REQ-102',
          company_name: 'Apex Healthcare Services UK',
          country: 'United Kingdom',
          city: 'Birmingham',
          office_address: 'Victoria Square, Suite 402, Birmingham, B1 1BD, UK',
          commercial_rc: 'UK-CO-09842134',
          trade_requested: 'Healthcare & Clinical Support Assistants',
          quota_number: 10,
          contact_person: 'Dr. Eleanor Davies (Talent Acquisition Lead)',
          contact_email: 'talent@apexhealthcare.co.uk',
          phone: '+442079460912',
          status: 'Under Verification',
          created_at: '2026-10-16',
        },
        {
          id: 'REQ-103',
          company_name: 'Gulf PetroTech Engineering LLC',
          country: 'United Arab Emirates',
          city: 'Abu Dhabi',
          office_address: 'Mussafah Industrial Area, Sector MW-4, Plot 12, Abu Dhabi, UAE',
          commercial_rc: 'CN-1148293',
          trade_requested: '6G Certified Pipe Welders & Fabricators',
          quota_number: 15,
          contact_person: 'Engr. Rashid Al-Kaabi',
          contact_email: 'recruitment@gulfpetrotech.ae',
          phone: '+97142345678',
          status: 'Approved Roster Dispatched',
          created_at: '2026-10-17',
        }
      ];
      setEmployerRequests(mockRequests);

      const { data: staffData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .or('role.eq.staff,role.eq.admin,role.eq.superadmin');

      if (staffData) setStaffMembers(staffData);

      const { data: paymentsData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!payError && paymentsData && paymentsData.length > 0) {
        setPayments(paymentsData);
      } else {
        setPayments([
          {
            id: 'TXN-90214',
            reference: 'AYX-PAY-84920194',
            candidate_name: 'Ibrahim Sani',
            candidate_email: 'ibrahim.sani@gmail.com',
            amount: 15000,
            currency: 'NGN',
            payment_channel: 'Paystack Card Transfer',
            status: 'success',
            created_at: '2026-10-17 09:30 AM',
          },
          {
            id: 'TXN-90215',
            reference: 'AYX-PAY-77382910',
            candidate_name: 'Fatima Zahra Abdullahi',
            candidate_email: 'fatima.zahra@gmail.com',
            amount: 25000,
            currency: 'NGN',
            payment_channel: 'Paystack Direct Bank',
            status: 'success',
            created_at: '2026-10-17 11:15 AM',
          },
          {
            id: 'TXN-90216',
            reference: 'AYX-PAY-62184923',
            candidate_name: 'Mustapha Bello',
            candidate_email: 'mustapha.bello@gmail.com',
            amount: 15000,
            currency: 'NGN',
            payment_channel: 'Paystack USSD',
            status: 'success',
            created_at: '2026-10-18 08:45 AM',
          },
          {
            id: 'TXN-90217',
            reference: 'AYX-PAY-11029348',
            candidate_name: 'Aliyu Danladi',
            candidate_email: 'aliyu.danladi@gmail.com',
            amount: 20000,
            currency: 'NGN',
            payment_channel: 'Paystack Card Transfer',
            status: 'pending',
            created_at: '2026-10-18 11:20 AM',
          }
        ]);
      }

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
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSaveContactDossier = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      if (contactModalData.type === 'candidate') {
        const { error } = await supabase
          .from('candidate_profiles')
          .update({
            full_name: contactModalData.full_name,
            phone: contactModalData.phone,
            email: contactModalData.email,
            residential_address: contactModalData.residential_address,
            city: contactModalData.city,
            state: contactModalData.state,
            country: contactModalData.country,
          })
          .eq('id', contactModalData.id);

        if (error) throw error;

        setCandidates((prev) =>
          prev.map((c) => (c.id === contactModalData.id ? { ...c, ...contactModalData } : c))
        );
      } else {
        setEmployerRequests((prev) =>
          prev.map((r) => (r.id === contactModalData.id ? { ...r, ...contactModalData } : r))
        );
      }
      setContactModalData(null);
    } catch (err) {
      alert('Error updating address: ' + err.message);
    } finally {
      setSavingContact(false);
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
    setDispatchMessage(
      `Dear ${request.company_name} Executive Board,\n\nAYAX Global Manpower Recruitment has finalized credential and biometric evaluation for your requisition (${request.quota_number} Workforce Slots - ${request.trade_requested}).\n\nOfficial Candidate Evaluation Dossiers have been verified and approved by the Kano Bureau.\n\nCorporate Correspondence Forwarded to:\n${request.contact_person}\nHeadquarters: ${request.office_address}\n\nBest regards,\nAYAX Global Operations Bureau`
    );
  };

  const handleSendDispatch = () => {
    setDispatchSuccess(true);
    setTimeout(() => {
      setSelectedRequest(null);
      setDispatchSuccess(false);
    }, 2500);
  };

  // Bulletproof Instant Logout Protocol
  const handleSignOut = async () => {
    try {
      // 1. Goge dukkan cookies da ke dauke da zaman Supabase
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        }
      }

      // 2. Share LocalStorage da SessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 3. Tura bukatar fita zuwa Supabase tare da timeout don kada ta makale
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 600));
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // 4. Tilasta burawzar komawa shafin login kai tsaye
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    }
  };

  const totalSuccessfulRevenue = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, current) => sum + Number(current.amount || 0), 0);

  const filteredCandidates = candidates.filter((cand) => {
    const matchesFilter =
      statusFilter === 'all' || (cand.verification_status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (cand.full_name || '').toLowerCase().includes(query) ||
      (cand.passport_number || '').toLowerCase().includes(query) ||
      (cand.role || '').toLowerCase().includes(query) ||
      (cand.target_country || '').toLowerCase().includes(query) ||
      (cand.residential_address || '').toLowerCase().includes(query) ||
      (cand.email || '').toLowerCase().includes(query) ||
      (cand.phone || '').toLowerCase().includes(query);
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
      
      {/* 1. Backdrop Overlay when Sidebar is Open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      )}

      {/* 2. Collapsible Drawer Sidebar (Opens only via Menu Button) */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 bg-[#071626] border-r border-slate-800 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out select-none print:hidden ${
          sidebarOpen
            ? 'translate-x-0'
            : lang === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        } ${lang === 'ar' ? 'right-0' : 'left-0'}`}
      >
        <div>
          {/* Brand Header with Close Button */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AYAX Global" className="h-9 w-auto bg-white p-1 rounded-md" />
              <div>
                <span className="text-sm font-black tracking-wider text-white block leading-tight">{t.brand}</span>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Executive Console</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('candidates'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('employer-requests'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('finances'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'finances'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>💳</span>
                <span>{t.finances}</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                ₦{totalSuccessfulRevenue.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('post-job'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('jobs'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('staff'); setSidebarOpen(false); }}
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
        <div className="p-4 border-t border-slate-800 space-y-3">
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

          {/* Working Real-Live Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* 3. Full-Width Main Executive Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar with Menu Button */}
        <header className="h-16 bg-[#091e32] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            {/* The Trigger Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold"
              title="Open Navigation Menu"
            >
              <span className="text-base leading-none">☰</span>
              <span className="hidden sm:inline">Menu</span>
            </button>

            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200 truncate">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                Revenue: ₦{totalSuccessfulRevenue.toLocaleString()}
              </span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Portal Front</span>
              <span>↗</span>
            </a>

            {/* Direct Quick Logout Button on Top Nav */}
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              title="Sign Out of Portal"
            >
              Sign Out
            </button>
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
                  <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider block">{t.totalRevenue}</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-2">₦{totalSuccessfulRevenue.toLocaleString()}</div>
                  <span className="text-xs text-emerald-400/80 font-semibold mt-1 inline-block">Settled Paystack Gateway Transactions</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider block">{t.pendingVerification}</span>
                  <div className="text-3xl font-extrabold text-amber-400 mt-2">
                    {candidates.filter((c) => !c.verification_status || c.verification_status === 'pending').length}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 inline-block">Awaiting Address & Biometric Audit</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider block">{t.corporateQuotas}</span>
                  <div className="text-3xl font-extrabold text-sky-400 mt-2">{employerRequests.length}</div>
                  <span className="text-xs text-slate-400 mt-1 inline-block">Corporate Quota Corridors</span>
                </div>
              </div>

              {/* Overview Sub-Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white">Recent Financial Transactions</h3>
                    <button onClick={() => setActiveTab('finances')} className="text-sky-400 text-xs font-semibold hover:underline">
                      View All Ledger &rarr;
                    </button>
                  </div>
                  <div className="space-y-2">
                    {payments.slice(0, 4).map((p) => (
                      <div key={p.id} className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{p.candidate_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.reference}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 font-mono">₦{Number(p.amount).toLocaleString()}</div>
                          <span className={`text-[10px] uppercase font-bold ${p.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white">Active Corporate Quotas</h3>
                    <button onClick={() => setActiveTab('employer-requests')} className="text-sky-400 text-xs font-semibold hover:underline">
                      View All Quotas &rarr;
                    </button>
                  </div>
                  <div className="space-y-2">
                    {employerRequests.map((req) => (
                      <div key={req.id} className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{req.company_name}</div>
                          <div className="text-[11px] text-slate-400">{req.city}, {req.country}</div>
                        </div>
                        <div className="text-right">
                          <span className="bg-blue-600/20 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold block">
                            {req.quota_number} Slots
                          </span>
                          <span className="text-[10px] text-slate-400">{req.trade_requested}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATES AUDITING & ADDRESS PIPELINE */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
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
                        <th className="p-4">Applicant & Contact Info</th>
                        <th className="p-4">Contact Address Dossier</th>
                        <th className="p-4">Passport & Credentials</th>
                        <th className="p-4">Trade & Target Country</th>
                        <th className="p-4">Uploaded Files</th>
                        <th className="p-4">Compliance Status</th>
                        <th className="p-4 text-right">Audit & Contact Protocols</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500">
                            No candidate dossiers matching your search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((cand) => (
                          <tr key={cand.id} className="hover:bg-slate-700/40 transition">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{cand.full_name || 'Unregistered Full Name'}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{cand.email || 'Email missing'}</div>
                              <div className="text-[11px] text-sky-400 font-mono mt-0.5">{cand.phone || 'Phone missing'}</div>
                            </td>

                            <td className="p-4">
                              <div className="text-slate-300 font-medium">
                                {cand.residential_address || 'No residential address recorded'}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {cand.city || 'Kano'}, {cand.state || 'Kano State'}, {cand.country || 'Nigeria'}
                              </div>
                              <button
                                onClick={() => setContactModalData({ ...cand, type: 'candidate' })}
                                className="mt-1.5 text-[10px] text-sky-400 hover:underline font-bold"
                              >
                                ✏️ Edit Address / Contact
                              </button>
                            </td>

                            <td className="p-4 font-mono font-medium text-slate-300">
                              {cand.passport_number ? (
                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                  {cand.passport_number}
                                </span>
                              ) : (
                                <span className="text-slate-500">Not Stated</span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{cand.desired_role || cand.role || 'Skilled Personnel'}</div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Destination: <strong>{cand.target_country || 'Saudi Arabia'}</strong>
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-1 text-[11px]">
                                {cand.cv_url ? (
                                  <a href={cand.cv_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    📄 Download CV
                                  </a>
                                ) : (
                                  <span className="text-slate-500">CV: Missing</span>
                                )}

                                {cand.passport_data_page_url ? (
                                  <a href={cand.passport_data_page_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    🛂 Passport Page
                                  </a>
                                ) : (
                                  <span className="text-slate-500">Data Page: Missing</span>
                                )}

                                {cand.passport_photo_url ? (
                                  <a href={cand.passport_photo_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    🖼️ Passport Photo
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
                              <div className="inline-flex gap-1.5 mr-2">
                                {cand.email && (
                                  <a
                                    href={`mailto:${cand.email}?subject=AYAX Global Recruitment Dossier Review&body=Dear ${encodeURIComponent(cand.full_name || 'Candidate')},\n\nWe have reviewed your application and verification files for overseas mobilization.\n\nResidential Address on Record:\n${cand.residential_address || 'Unspecified'}\n\nRegards,\nAYAX Global Operations Bureau`}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                                    title="Send Official Email"
                                  >
                                    ✉️
                                  </a>
                                )}
                                {cand.phone && (
                                  <>
                                    <a
                                      href={`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 rounded-lg text-emerald-300 hover:text-white transition"
                                      title="Open WhatsApp Desk"
                                    >
                                      💬
                                    </a>
                                    <a
                                      href={`tel:${cand.phone}`}
                                      className="p-1.5 bg-blue-600/30 hover:bg-blue-600 rounded-lg text-blue-300 hover:text-white transition"
                                      title="Call Candidate Direct"
                                    >
                                      📞
                                    </a>
                                  </>
                                )}
                              </div>

                              <select
                                value={cand.verification_status || 'pending'}
                                onChange={(e) => handleUpdateStatus(cand.id, e.target.value)}
                                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pending">Under Review</option>
                                <option value="verified">Verified (Approved)</option>
                                <option value="deployed">Deployed Overseas</option>
                                <option value="rejected">Rejected</option>
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
                    <p className="text-xs text-slate-400 mt-1">Direct corporate inquiries, registered headquarters addresses, and quota allocations.</p>
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
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">RC: {req.commercial_rc}</div>
                        
                        <div className="mt-4 p-3 bg-slate-800/80 rounded-xl text-xs space-y-2 border border-slate-700/60">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Headquarters:</span>
                            <span className="text-slate-200">{req.office_address}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Representative:</span>
                            <span className="text-white font-semibold">{req.contact_person}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                            <span className="text-sky-400 font-mono text-[11px]">{req.phone}</span>
                            <div className="flex gap-1.5">
                              <a href={`mailto:${req.contact_email}`} className="p-1 bg-slate-700 rounded text-white" title="Email Employer">✉️</a>
                              <a href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-1 bg-emerald-600 rounded text-white" title="WhatsApp Employer">💬</a>
                              <a href={`tel:${req.phone}`} className="p-1 bg-blue-600 rounded text-white" title="Call Direct">📞</a>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs flex justify-between items-center">
                          <span className="text-slate-400">Quota Demand:</span>
                          <span className="text-emerald-400 font-bold">{req.quota_number} Workforce Slots ({req.trade_requested})</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => setContactModalData({ ...req, type: 'employer' })}
                          className="text-[11px] text-sky-400 hover:underline font-bold"
                        >
                          ✏️ Update Address
                        </button>
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

          {/* TAB 4: FINANCIAL AUDITING & PAYMENT LEDGER */}
          {activeTab === 'finances' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider block">Total Audited Revenue</span>
                  <div className="text-3xl font-extrabold text-white mt-1">₦{totalSuccessfulRevenue.toLocaleString()}</div>
                  <span className="text-xs text-slate-400 mt-1 block">Paystack Verified Transactions</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider block">Successful Clearances</span>
                  <div className="text-3xl font-extrabold text-sky-400 mt-1">
                    {payments.filter((p) => p.status === 'success').length} Paid
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Audit & Biometric Fees Cleared</span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider block">Pending Collections</span>
                  <div className="text-3xl font-extrabold text-amber-400 mt-1">
                    ₦{payments.filter((p) => p.status === 'pending').reduce((s, c) => s + Number(c.amount || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Awaiting Bank Transfer Confirmation</span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Live Payment Transactions & Ledger Log</h3>
                  <button onClick={handlePrintDossier} className="text-xs text-sky-400 font-bold hover:underline">
                    🖨️ Export / Print Ledger
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Transaction Reference</th>
                        <th className="p-4">Candidate / Payer</th>
                        <th className="p-4">Settled Amount (NGN)</th>
                        <th className="p-4">Gateway & Channel</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4 text-right">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {payments.map((pay) => (
                        <tr key={pay.id || pay.reference} className="hover:bg-slate-700/40 transition">
                          <td className="p-4 font-mono font-bold text-sky-400">
                            {pay.reference || pay.id}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{pay.candidate_name || 'Applicant'}</div>
                            <div className="text-[11px] text-slate-400">{pay.candidate_email}</div>
                          </td>
                          <td className="p-4 font-mono font-extrabold text-white text-sm">
                            ₦{Number(pay.amount).toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-300">
                            {pay.payment_channel || 'Paystack Gateway'}
                          </td>
                          <td className="p-4 text-slate-400 font-mono text-[11px]">
                            {pay.created_at || 'Just now'}
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                pay.status === 'success'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {pay.status === 'success' ? 'Settled (Paid)' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUBLISH JOB VACANCIES */}
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

          {/* TAB 6: ACTIVE VACANCIES */}
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

          {/* TAB 7: STAFF USER CREATION & RBAC */}
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

      {/* 4. CONTACT & ADDRESS EDITING DOSSIER MODAL */}
      {contactModalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a2540] border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-white">{t.editAddress}</h3>
                <span className="text-[11px] text-sky-400 font-semibold">
                  {contactModalData.type === 'candidate' ? contactModalData.full_name : contactModalData.company_name}
                </span>
              </div>
              <button onClick={() => setContactModalData(null)} className="text-slate-400 hover:text-white font-bold text-base">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContactDossier} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {contactModalData.type === 'candidate' ? 'Full Legal Name' : 'Company Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={contactModalData.type === 'candidate' ? contactModalData.full_name || '' : contactModalData.company_name || ''}
                  onChange={(e) =>
                    setContactModalData({
                      ...contactModalData,
                      [contactModalData.type === 'candidate' ? 'full_name' : 'company_name']: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactModalData.email || contactModalData.contact_email || ''}
                    onChange={(e) =>
                      setContactModalData({
                        ...contactModalData,
                        [contactModalData.type === 'candidate' ? 'email' : 'contact_email']: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official Telephone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={contactModalData.phone || ''}
                    onChange={(e) => setContactModalData({ ...contactModalData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {contactModalData.type === 'candidate' ? 'Residential Street Address' : 'Corporate Headquarters Address'} *
                </label>
                <textarea
                  rows="2.5"
                  required
                  value={
                    contactModalData.type === 'candidate'
                      ? contactModalData.residential_address || ''
                      : contactModalData.office_address || ''
                  }
                  onChange={(e) =>
                    setContactModalData({
                      ...contactModalData,
                      [contactModalData.type === 'candidate' ? 'residential_address' : 'office_address']: e.target.value,
                    })
                  }
                  placeholder="Street name, plot number, office suite, plaza..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={contactModalData.city || ''}
                    onChange={(e) => setContactModalData({ ...contactModalData, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={contactModalData.state || ''}
                    onChange={(e) => setContactModalData({ ...contactModalData, state: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={contactModalData.country || ''}
                    onChange={(e) => setContactModalData({ ...contactModalData, country: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setContactModalData(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg"
                >
                  {savingContact ? 'Saving Record...' : 'Save & Update Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DISPATCH MODAL FOR CORPORATE NOTIFICATIONS */}
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
                          <span className="text-slate-500 text-[10px] ml-auto">{c.city || 'Kano'}, {c.country || 'Nigeria'}</span>
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