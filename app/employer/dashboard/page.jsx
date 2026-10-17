'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function EmployerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('demands'); // 'demands' ko 'new-demand' ko 'talent-pool'
  
  // Jihohin Bayanai
  const [myDemands, setMyDemands] = useState([]);
  const [verifiedTalents, setVerifiedTalents] = useState([]);

  // Fannonin Tura Buƙatar Ma'aikata
  const [jobCategory, setJobCategory] = useState('');
  const [quotaNeeded, setQuotaNeeded] = useState(10);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

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

      // Tabbatar ko asusun Employer ne
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'employer') {
        alert('Access restricted to Employer accounts.');
        router.push('/login');
        return;
      }

      // Ɗauko bayanan kamfani
      const { data: empData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (empData) {
        setCompanyProfile(empData);
        setDestinationCountry(empData.country || '');
      }

      await loadEmployerData(session.user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployerData = async (employerId) => {
    // 1. Ɗauko buƙatun da wannan kamfanin ya riga ya tura
    const { data: demandsData } = await supabase
      .from('employer_demands')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (demandsData) setMyDemands(demandsData);

    // 2. Ɗauko jerin ma'aikatan da aka riga aka tantance takardunsu (Verified Talent Pool)
    const { data: talentsData } = await supabase
      .from('candidate_profiles')
      .select('id, full_name, cv_url, verification_status')
      .eq('verification_status', 'verified');

    if (talentsData) setVerifiedTalents(talentsData);
  };

  // Tura sabuwar buƙatar ma'aikata
  const handleSubmitDemand = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.from('employer_demands').insert([
        {
          employer_id: session.user.id,
          job_category: jobCategory,
          quota_needed: Number(quotaNeeded),
          destination_country: destinationCountry,
          salary_offered: salaryOffered,
          requirements: requirements,
          status: 'under_review',
        },
      ]);

      if (error) throw error;

      setFeedbackMsg({ type: 'success', text: 'Demand sheet submitted successfully! Our mobilization team will review it.' });
      setJobCategory('');
      setQuotaNeeded(10);
      setSalaryOffered('');
      setRequirements('');
      await loadEmployerData(session.user.id);
      setActiveTab('demands');
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit demand sheet.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-600">Loading Employer Portal Desk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-[#0a2540]">
              {companyProfile?.company_name || 'Enterprise'} | Workforce Portal
            </h1>
            <p className="text-xs text-slate-500">
              Corridor: <span className="font-semibold text-slate-700">{companyProfile?.country || 'International'}</span> &bull; Contact: {companyProfile?.contact_person}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('demands')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'demands'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Active Demands ({myDemands.length})
          </button>
          <button
            onClick={() => setActiveTab('new-demand')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'new-demand'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            + Request Manpower Quota
          </button>
          <button
            onClick={() => setActiveTab('talent-pool')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'talent-pool'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Pre-Screened Talent Pool ({verifiedTalents.length})
          </button>
        </div>

        {/* 1. Jerin Bukatun da Kamfanin Ya Tura */}
        {activeTab === 'demands' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0a2540]">Submitted Quota Demands & Mobilization Pipeline</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Job Category</th>
                    <th className="p-3">Quota Required</th>
                    <th className="p-3">Deployment Country</th>
                    <th className="p-3">Salary Offering</th>
                    <th className="p-3">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myDemands.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No active quota demands found. Click "+ Request Manpower Quota" to submit your specifications.
                      </td>
                    </tr>
                  ) : (
                    myDemands.map((demand) => (
                      <tr key={demand.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{demand.job_category}</td>
                        <td className="p-3 font-semibold text-slate-700">{demand.quota_needed} Personnel</td>
                        <td className="p-3 text-slate-600">{demand.destination_country}</td>
                        <td className="p-3 text-slate-600">{demand.salary_offered || 'As per contractual terms'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              demand.status === 'fulfilled'
                                ? 'bg-green-100 text-green-700'
                                : demand.status === 'sourcing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
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
        )}

        {/* 2. Fom din Tura Sabuwar Bukata */}
        {activeTab === 'new-demand' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm mx-auto">
            <h2 className="text-base font-bold text-[#0a2540] mb-1">Submit Quota Demand Specifications</h2>
            <p className="text-xs text-slate-500 mb-4">
              State the workforce categories, volume, and compensation package for review by our operations desk.
            </p>

            {feedbackMsg.text && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitDemand} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workforce Trade / Category *</label>
                <input
                  type="text"
                  required
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  placeholder="e.g. Certified Welders, Facilities Crew, Warehouse Sorters, Fleet Drivers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Headcount (Quota) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quotaNeeded}
                    onChange={(e) => setQuotaNeeded(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Country / Site *</label>
                  <input
                    type="text"
                    required
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    placeholder="e.g. Saudi Arabia, UAE, Poland, Qatar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Offered Monthly Salary & Allowances</label>
                <input
                  type="text"
                  value={salaryOffered}
                  onChange={(e) => setSalaryOffered(e.target.value)}
                  placeholder="e.g. 2,500 AED + Free Accommodation & Medical"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Job Requirements / Vetting Criteria</label>
                <textarea
                  rows="3"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Specify English proficiency levels, certifications (AWS, GAMCA, Trade test), or age limits..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-slate-400"
              >
                {submitting ? 'Submitting Demand Sheet...' : 'Submit Manpower Demand'}
              </button>
            </form>
          </div>
        )}

        {/* 3. Bangaren Duba Ma'aikatan da Suka Cancanta (Pre-Screened Talent Pool) */}
        {activeTab === 'talent-pool' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0a2540]">Verified Candidate Roster</h2>
              <p className="text-xs text-slate-500">
                Candidates with verified biometric credentials and background clearances ready for mobilization quotas.
              </p>
            </div>

            {verifiedTalents.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                No verified candidates available in the pool currently. Profiles will appear here once cleared by our verification desk.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedTalents.map((talent) => (
                  <div key={talent.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full uppercase">
                          ✓ Verified Candidate
                        </span>
                      </div>
                      <h3 className="font-bold text-[#0a2540] text-sm mb-1">{talent.full_name}</h3>
                      <p className="text-xs text-slate-500 mb-4">Biometrics & Police Clearance Verified</p>
                    </div>

                    {talent.cv_url ? (
                      <a
                        href={talent.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#0a2540] font-bold text-xs rounded-lg text-center transition flex items-center justify-center gap-1.5"
                      >
                        📄 Review Candidate Profile / CV
                      </a>
                    ) : (
                      <button disabled className="w-full py-2 bg-slate-50 text-slate-400 text-xs rounded-lg cursor-not-allowed">
                        Profile Under Compilation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}