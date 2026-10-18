'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline'); // pipeline, corporate-demands, candidate-dossier
  const [lang, setLang] = useState('en');

  // Collections
  const [candidates, setCandidates] = useState([]);
  const [employerDemands, setEmployerDemands] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Audit Feedback State
  const [auditNotes, setAuditNotes] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // International Localization Dictionary
  const translations = {
    en: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Staff Compliance & Auditing Desk',
      pipelineTab: 'Candidate Auditing Pipeline',
      demandsTab: 'Corporate Quota Requisitions',
      dossierTab: 'Active Candidate Dossier',
      signOut: 'Sign Out',
      searchPlaceholder: 'Search applicant name, passport, trade, phone, or email...',
      statusAll: 'All Compliance Stages',
      pending: 'Under Review',
      verified: 'Verified & Cleared',
      biometrics: 'GAMCA / Biometrics Cleared',
      rejected: 'Audit Failed',
      auditAction: 'Verification Protocol',
      printDossier: 'Print Physical Dossier',
      sendEmail: 'Official Email',
      whatsapp: 'WhatsApp Desk',
      call: 'Direct Call',
      downloadCv: 'Inspect CV / Resume',
      viewPassport: 'Inspect Passport Data Page',
      viewPhoto: 'Passport Photograph',
      totalReviewed: 'Total Dossiers Under Desk',
      pendingAuditCount: 'Pending Physical Audit',
      clearedCount: 'Deployment Ready Talent',
      corporateQuotasCount: 'Active Corporate Demands',
      saveAuditNotes: 'Save Officer Audit Report',
    },
    ar: {
      brand: 'أياكس العالمية',
      portalTitle: 'مكتب التدقيق ومطابقة المعايير المهنية',
      pipelineTab: 'جدول تدقيق واعتماد المرشحين',
      demandsTab: 'طلبات الشركات وحصص التوظيف',
      dossierTab: 'الملف الفني للمرشح',
      signOut: 'تسجيل الخروج',
      searchPlaceholder: 'ابحث بالاسم، الجواز، المهنة، الهاتف أو البريد...',
      statusAll: 'جميع مراحل التدقيق',
      pending: 'قيد الفحص والمراجعة',
      verified: 'معتمد ومستوفٍ للشروط',
      biometrics: 'اجتاز الفحص الطبي والبصمات',
      rejected: 'مرفوض لعدم استيفاء الشروط',
      auditAction: 'إجراءات الاعتماد',
      printDossier: 'طباعة الملف الورقي',
      sendEmail: 'إرسال بريد رسمي',
      whatsapp: 'واتساب مباشر',
      call: 'اتصال هاتفي',
      downloadCv: 'معاينة السيرة الذاتية',
      viewPassport: 'فحص صفحة الجواز',
      viewPhoto: 'الصورة الشخصية',
      totalReviewed: 'إجمالي الملفات قيد التدقيق',
      pendingAuditCount: 'ملفات بانتظار المراجعة',
      clearedCount: 'كوادر جاهزة للإيفاد',
      corporateQuotasCount: 'طلبات التوظيف النشطة',
      saveAuditNotes: 'حفظ تقرير الضابط المعتمد',
    },
    fr: {
      brand: 'AYAX GLOBAL',
      portalTitle: 'Bureau d’Audit et de Conformité',
      pipelineTab: 'Audit des Dossiers Candidats',
      demandsTab: 'Demandes de Quotas Entreprises',
      dossierTab: 'Dossier Technique Candidat',
      signOut: 'Déconnexion',
      searchPlaceholder: 'Rechercher par nom, passeport, métier, téléphone...',
      statusAll: 'Toutes les étapes',
      pending: 'En Cours d’Examen',
      verified: 'Vérifié & Conforme',
      biometrics: 'Biométrie & Visite Médicale Validée',
      rejected: 'Non Conforme',
      auditAction: 'Protocole de Validation',
      printDossier: 'Imprimer Dossier Physique',
      sendEmail: 'Email Officiel',
      whatsapp: 'Contact WhatsApp',
      call: 'Appel Direct',
      downloadCv: 'Consulter le CV',
      viewPassport: 'Consulter Page Passeport',
      viewPhoto: 'Photo d’Identité',
      totalReviewed: 'Total Candidats Enregistrés',
      pendingAuditCount: 'En Attente de Vérification',
      clearedCount: 'Profils Prêts au Déploiement',
      corporateQuotasCount: 'Demandes Entreprises Actives',
      saveAuditNotes: 'Enregistrer le Rapport d’Audit',
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    checkStaffAuthAndLoad();
  }, []);

  const checkStaffAuthAndLoad = async () => {
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
      if (normalizedRole !== 'staff' && normalizedRole !== 'admin' && normalizedRole !== 'superadmin') {
        alert('Access restricted to Authorized Staff & Auditors.');
        router.push('/login');
        return;
      }

      await loadStaffPortalData();
    } catch (err) {
      console.error('Staff Auth Error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffPortalData = async () => {
    try {
      // 1. Fetch Candidates
      const { data: candidatesData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .neq('role', 'admin')
        .order('id', { ascending: false });

      if (candidatesData && candidatesData.length > 0) {
        setCandidates(candidatesData);
        setSelectedCandidate(candidatesData[0]);
      } else {
        // Fallback sample data for testing
        const sampleCandidates = [
          {
            id: 'CAN-801',
            full_name: 'Ibrahim Sani',
            phone: '+2348161444444',
            email: 'ibrahim.sani@gmail.com',
            passport_number: 'A09482910',
            desired_role: 'Heavy Fleet Transport Specialist',
            target_country: 'Saudi Arabia',
            residential_address: 'Suite 14, Dala Central Corridor, Kano State',
            city: 'Kano',
            state: 'Kano',
            country: 'Nigeria',
            verification_status: 'verified',
            cv_url: '#',
            passport_data_page_url: '#',
            passport_photo_url: '#',
            audit_notes: 'Passed trade driving practical workshop. Biometrics confirmed.',
          },
          {
            id: 'CAN-802',
            full_name: 'Fatima Zahra Abdullahi',
            phone: '+2347087244444',
            email: 'fatima.zahra@gmail.com',
            passport_number: 'B08219483',
            desired_role: 'Registered Healthcare Assistant',
            target_country: 'United Kingdom',
            residential_address: 'Nasarawa GRA, Kano Municipal, Kano',
            city: 'Kano',
            state: 'Kano',
            country: 'Nigeria',
            verification_status: 'pending',
            cv_url: '#',
            passport_data_page_url: '#',
            passport_photo_url: '#',
            audit_notes: 'Nursing council credential verification ongoing.',
          },
          {
            id: 'CAN-803',
            full_name: 'Mustapha Bello',
            phone: '+2348021113333',
            email: 'mustapha.bello@gmail.com',
            passport_number: 'A07381920',
            desired_role: '6G Pipeline Welder & Fabricator',
            target_country: 'United Arab Emirates',
            residential_address: 'Fagge Commercial Area, Kano',
            city: 'Kano',
            state: 'Kano',
            country: 'Nigeria',
            verification_status: 'verified',
            cv_url: '#',
            passport_data_page_url: '#',
            passport_photo_url: '#',
            audit_notes: 'GAMCA medical test passed; 6G weld x-ray verified.',
          }
        ];
        setCandidates(sampleCandidates);
        setSelectedCandidate(sampleCandidates[0]);
      }

      // 2. Fetch Corporate Quota Demands
      const { data: demandsData } = await supabase
        .from('employer_demands')
        .select('*')
        .order('created_at', { ascending: false });

      if (demandsData && demandsData.length > 0) {
        setEmployerDemands(demandsData);
      } else {
        setEmployerDemands([
          {
            id: 'REQ-501',
            company_name: 'Al-Bawani Logistics Group Ltd',
            destination_country: 'Saudi Arabia',
            job_category: 'Heavy Fleet Transport Drivers',
            quota_needed: 25,
            salary_offered: '3,200 SAR / Month + Lodging',
            status: 'sourcing',
          },
          {
            id: 'REQ-502',
            company_name: 'Apex Healthcare Services UK',
            destination_country: 'United Kingdom',
            job_category: 'Healthcare & Clinical Support Assistants',
            quota_needed: 10,
            salary_offered: '£24,000 / Year + Sponsorship',
            status: 'under_review',
          },
          {
            id: 'REQ-503',
            company_name: 'Gulf PetroTech Engineering LLC',
            destination_country: 'United Arab Emirates',
            job_category: '6G Certified Pipe Welders',
            quota_needed: 15,
            salary_offered: '3,500 AED / Month + Airfare',
            status: 'fulfilled',
          }
        ]);
      }
    } catch (err) {
      console.error('Data Loading Notice:', err);
    }
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    setUpdatingId(candidateId);
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({
          verification_status: newStatus,
          audit_notes: auditNotes || undefined,
        })
        .eq('id', candidateId);

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, verification_status: newStatus, audit_notes: auditNotes || c.audit_notes }
            : c
        )
      );

      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate((prev) => ({
          ...prev,
          verification_status: newStatus,
          audit_notes: auditNotes || prev.audit_notes,
        }));
      }
    } catch (err) {
      alert('Error updating compliance status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  const filteredCandidates = candidates.filter((cand) => {
    const matchesFilter =
      statusFilter === 'all' || (cand.verification_status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (cand.full_name || '').toLowerCase().includes(query) ||
      (cand.passport_number || '').toLowerCase().includes(query) ||
      (cand.desired_role || cand.role || '').toLowerCase().includes(query) ||
      (cand.target_country || '').toLowerCase().includes(query) ||
      (cand.city || '').toLowerCase().includes(query) ||
      (cand.email || '').toLowerCase().includes(query) ||
      (cand.phone || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-300">
            Initializing AYAX Staff Auditing Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      {/* 1. Backdrop Overlay when Sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      )}

      {/* 2. Slide Drawer Sidebar */}
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
          {/* Header & Close Button */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AYAX Global" className="h-9 w-auto bg-white p-1 rounded-md" />
              <div>
                <span className="text-sm font-black tracking-wider text-white block leading-tight">{t.brand}</span>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Staff Desk</span>
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
              onClick={() => { setActiveTab('pipeline'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'pipeline'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>📑</span>
                <span>{t.pipelineTab}</span>
              </div>
              <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('corporate-demands'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'corporate-demands'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>🏢</span>
                <span>{t.demandsTab}</span>
              </div>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {employerDemands.length}
              </span>
            </button>

            {selectedCandidate && (
              <button
                onClick={() => { setActiveTab('candidate-dossier'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'candidate-dossier'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🗂️</span>
                <span>{t.dossierTab}</span>
              </button>
            )}
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

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#091e32] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold"
            >
              <span className="text-base leading-none">☰</span>
              <span className="hidden sm:inline">Menu</span>
            </button>

            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200 truncate">
              {t.portalTitle} &bull; <span className="text-sky-400">{activeTab.replace('-', ' ')}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Main Portal</span>
              <span>↗</span>
            </a>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              {t.signOut}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-6 flex-1">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">{t.totalReviewed}</span>
              <div className="text-3xl font-extrabold text-white mt-2">{candidates.length}</div>
              <span className="text-xs text-sky-400 font-semibold mt-1 inline-block">Registered Talent Files</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider block">{t.pendingAuditCount}</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">
                {candidates.filter((c) => !c.verification_status || c.verification_status === 'pending').length}
              </div>
              <span className="text-xs text-slate-400 mt-1 inline-block">Awaiting Document Audit</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider block">{t.clearedCount}</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                {candidates.filter((c) => c.verification_status === 'verified').length}
              </div>
              <span className="text-xs text-emerald-400/80 font-semibold mt-1 inline-block">Approved for Overseas Quotas</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider block">{t.corporateQuotasCount}</span>
              <div className="text-3xl font-extrabold text-sky-400 mt-2">{employerDemands.length}</div>
              <span className="text-xs text-slate-400 mt-1 inline-block">Employer Requisitions</span>
            </div>
          </div>

          {/* TAB 1: AUDITING PIPELINE */}
          {activeTab === 'pipeline' && (
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
                    <option value="biometrics">{t.biometrics}</option>
                    <option value="rejected">{t.rejected}</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>{t.printDossier}</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Applicant Profile</th>
                        <th className="p-4">Passport & Credentials</th>
                        <th className="p-4">Trade & Destination</th>
                        <th className="p-4">Verification Files</th>
                        <th className="p-4">Audit Status</th>
                        <th className="p-4 text-right">Compliance Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No candidate files matched the audit query.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((cand) => (
                          <tr key={cand.id} className="hover:bg-slate-700/40 transition">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{cand.full_name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{cand.email}</div>
                              <div className="text-[11px] text-sky-400 font-mono mt-0.5">{cand.phone}</div>
                            </td>

                            <td className="p-4 font-mono font-medium text-slate-300">
                              {cand.passport_number ? (
                                <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                                  {cand.passport_number}
                                </span>
                              ) : (
                                <span className="text-slate-500">Missing Passport</span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{cand.desired_role || cand.role}</div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Target: <strong>{cand.target_country || 'Saudi Arabia'}</strong>
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-1 text-[11px]">
                                {cand.cv_url ? (
                                  <a href={cand.cv_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    📄 {t.downloadCv}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">CV: Missing</span>
                                )}

                                {cand.passport_data_page_url ? (
                                  <a href={cand.passport_data_page_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
                                    🛂 {t.viewPassport}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">Data Page: Missing</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  cand.verification_status === 'verified'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : cand.verification_status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {cand.verification_status || 'Under Review'}
                              </span>
                            </td>

                            <td className="p-4 text-right space-x-2">
                              {/* Direct Contact Icons */}
                              <div className="inline-flex gap-1.5 mr-2">
                                {cand.email && (
                                  <a
                                    href={`mailto:${cand.email}?subject=AYAX Verification Desk Notice&body=Dear ${encodeURIComponent(cand.full_name)},\n\nYour international employment credentials have been audited by the Kano operations center.\n\nRegards,\nAYAX Staff Audit Desk`}
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
                                      title="Direct Phone Call"
                                    >
                                      📞
                                    </a>
                                  </>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedCandidate(cand);
                                  setAuditNotes(cand.audit_notes || '');
                                  setActiveTab('candidate-dossier');
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition text-[11px]"
                              >
                                Inspect Dossier &rarr;
                              </button>
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

          {/* TAB 2: CORPORATE QUOTA DEMANDS */}
          {activeTab === 'corporate-demands' && (
            <div className="space-y-6">
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Active Corporate Manpower Demands</h3>
                    <p className="text-xs text-slate-400 mt-1">Review verified overseas employer requisitions to match cleared candidates.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employerDemands.map((req) => (
                    <div key={req.id} className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-400 px-2.5 py-1 rounded-md border border-blue-500/30">
                            {req.destination_country || 'GCC Corridor'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                        </div>

                        <h4 className="font-extrabold text-white text-base leading-snug">{req.company_name}</h4>
                        <div className="mt-3 p-3 bg-slate-800/80 rounded-xl text-xs space-y-1.5 border border-slate-700/60">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Required Trade:</span>
                            <strong className="text-white">{req.job_category}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Quota Volume:</span>
                            <strong className="text-sky-400">{req.quota_needed} Workforce Slots</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Offered Salary:</span>
                            <span className="text-emerald-400 font-semibold">{req.salary_offered}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {req.status?.replace('_', ' ') || 'Sourcing'}
                        </span>
                        <button
                          onClick={() => {
                            setSearchQuery(req.job_category?.split(' ')[0] || '');
                            setActiveTab('pipeline');
                          }}
                          className="text-sky-400 hover:underline font-bold text-[11px]"
                        >
                          Match Candidates &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CANDIDATE DOSSIER INSPECTOR */}
          {activeTab === 'candidate-dossier' && selectedCandidate && (
            <div className="max-w-4xl mx-auto bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">Candidate Auditing Dossier</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{selectedCandidate.full_name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Passport: <strong className="text-white font-mono">{selectedCandidate.passport_number || 'N/A'}</strong> &bull; Target: {selectedCandidate.target_country || 'Saudi Arabia'}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition"
                >
                  🖨️ {t.printDossier}
                </button>
              </div>

              {/* Contact & Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Contact Coordinates</span>
                  <div>Telephone: <strong className="text-white">{selectedCandidate.phone || 'N/A'}</strong></div>
                  <div>Email: <strong className="text-white">{selectedCandidate.email || 'N/A'}</strong></div>
                  <div>Origin City: <strong className="text-white">{selectedCandidate.city || 'Kano'}, {selectedCandidate.country || 'Nigeria'}</strong></div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Residential Address</span>
                  <div className="text-slate-200">{selectedCandidate.residential_address || 'Suite C13/C14 Yam Musa Plaza, Kano'}</div>
                  <div className="text-slate-400 text-[11px] mt-1">Verified physical residency during Kano trade evaluation test.</div>
                </div>
              </div>

              {/* Uploaded Verification Files */}
              <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Audited Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={selectedCandidate.cv_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-center block transition font-semibold text-sky-400"
                  >
                    📄 {t.downloadCv}
                  </a>
                  <a
                    href={selectedCandidate.passport_data_page_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-center block transition font-semibold text-sky-400"
                  >
                    🛂 {t.viewPassport}
                  </a>
                  <a
                    href={selectedCandidate.passport_photo_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-center block transition font-semibold text-sky-400"
                  >
                    🖼️ {t.viewPhoto}
                  </a>
                </div>
              </div>

              {/* Officer Audit Notes & Decision */}
              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-slate-300">Staff Officer Audit Findings & Remarks</label>
                <textarea
                  rows="3.5"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Record trade test results, GAMCA medical center status, police biometric report details..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={updatingId === selectedCandidate.id}
                      onClick={() => handleUpdateStatus(selectedCandidate.id, 'verified')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-sm"
                    >
                      ✓ Approve & Verify Candidate
                    </button>
                    <button
                      disabled={updatingId === selectedCandidate.id}
                      onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-sm"
                    >
                      ✕ Reject Candidate
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                  >
                    &larr; Back to Full Pipeline
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}