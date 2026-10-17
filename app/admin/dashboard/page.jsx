'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' ko 'post-job' ko 'jobs'
  
  // Jerin masu nema da ayyuka
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Fannonin ɗora sabon aiki
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [regFee, setRegFee] = useState(15000);
  const [timeline, setTimeline] = useState('');
  const [processingDetails, setProcessingDetails] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

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

      // Tabbatar ko mai shiga Admin ne ko Staff
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userErr || (userData?.role !== 'admin' && userData?.role !== 'staff')) {
        alert('Access Denied: Admins & Staff only.');
        router.push('/login');
        return;
      }

      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    // 1. Ɗauko dukkan bayanan masu nema tare da takardun da suka loda
    const { data: candidateData } = await supabase
      .from('candidate_profiles')
      .select('*, users(email, phone)')
      .order('id', { ascending: false });

    if (candidateData) setCandidates(candidateData);

    // 2. Ɗauko jerin ayyukan da ke rumbun adanawa
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobData) setJobs(jobData);
  };

  // Aikin ɗora sabon aiki
  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    setFeedbackMsg({ type: '', text: '' });

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

      setFeedbackMsg({ type: 'success', text: 'Sabon aiki ya kammala ɗoruwa cikin nasara!' });
      setJobTitle('');
      setCountry('');
      setSalaryRange('');
      setTimeline('');
      setProcessingDetails('');
      loadDashboardData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Kuskure wajen ɗora aiki' });
    } finally {
      setPostingJob(false);
    }
  };

  // Aikin canja matsayin takardu (Verify/Reject)
  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({ verification_status: newStatus })
        .eq('id', candidateId);

      if (error) throw error;
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Kuskure wajen sauya matsayi');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm font-bold text-slate-600">Ana buɗe teburin gudanarwa (Admin Dashboard)...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar na Admin */}
      <header className="bg-[#0a2540] text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-extrabold tracking-wide">AYAX GLOBAL | Control Desk</h1>
          <p className="text-xs text-slate-300">Super Admin & Verification Operations</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Menu da Kayan Aiki */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        <div className="flex gap-3 mb-6 border-b border-slate-300 pb-3">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'candidates'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Masu Neman Aiki da Takardu ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('post-job')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'post-job'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            + Ɗora Sabon Aiki (Post Job)
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'jobs'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Jerin Ayyukan da Ke Shafi ({jobs.length})
          </button>
        </div>

        {/* 1. Bangaren Duba Takardun Masu Nema */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">Takardun Masu Neman Aiki (Auditing Pipeline)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Suna / Lambar Waya</th>
                    <th className="p-3">Lambar Fasfo</th>
                    <th className="p-3">Takardun da Aka Loda (Files)</th>
                    <th className="p-3">Matsayi (Status)</th>
                    <th className="p-3">Matakin Tantancewa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">
                        Babu wani mai nema da ya loda takardu tukunna.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{cand.full_name || 'Babu Suna'}</div>
                          <div className="text-[11px] text-slate-500">{cand.users?.email}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{cand.users?.phone}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {cand.passport_number || 'Ba a saka ba'}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {cand.cv_url ? (
                              <a
                                href={cand.cv_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                📄 Sauke CV / Resume
                              </a>
                            ) : (
                              <span className="text-slate-400">CV: Babu</span>
                            )}

                            {cand.passport_data_page_url ? (
                              <a
                                href={cand.passport_data_page_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                🛂 Duba Passport Data Page
                              </a>
                            ) : (
                              <span className="text-slate-400">Passport: Babu</span>
                            )}

                            {cand.passport_photo_url ? (
                              <a
                                href={cand.passport_photo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                🖼️ Duba Hoton Fasfo
                              </a>
                            ) : (
                              <span className="text-slate-400">Hoto: Babu</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              cand.verification_status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : cand.verification_status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {cand.verification_status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(cand.id, 'verified')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-semibold transition"
                            >
                              Tabbatar (Verify)
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(cand.id, 'rejected')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition"
                            >
                              Ƙi (Reject)
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Bangaren Dora Sabon Aiki */}
        {activeTab === 'post-job' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm mx-auto">
            <h2 className="text-base font-bold text-[#0a2540] mb-1">Ɗora Sabon Gurbin Aiki (Post Job Vacancy)</h2>
            <p className="text-xs text-slate-500 mb-4">Wannan aikin zai fito nan take ga masu neman aiki a portal.</p>

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

            <form onSubmit={handlePostJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Taken Aiki (Job Title) *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Misali: Certified MIG/TIG Welder"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ƙasa (Destination Country) *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Misali: UAE, Saudi Arabia, Poland"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kimanin Albashi (Salary Range) *</label>
                  <input
                    type="text"
                    required
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="Misali: 2,500 - 3,500 SAR / month"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuɗin Rajista / Verification (₦) *</label>
                  <input
                    type="number"
                    required
                    value={regFee}
                    onChange={(e) => setRegFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wa'adin Fitar Biza (Timeline) *</label>
                  <input
                    type="text"
                    required
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Misali: Watanni 2 zuwa 3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Karin Bayanin Kudin Processing da Ka'idoji</label>
                <textarea
                  rows="3"
                  value={processingDetails}
                  onChange={(e) => setProcessingDetails(e.target.value)}
                  placeholder="Bayanin kudin tikiti, masauki, ko gwajin lafiya (GAMCA/Medical)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={postingJob}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-slate-400"
              >
                {postingJob ? 'Ana ɗorawa...' : 'Wallafa Wannan Aiki (Publish Job)'}
              </button>
            </form>
          </div>
        )}

        {/* 3. Bangaren Jerin Ayyuka */}
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {job.country}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">Albashi: {job.salary_range}</p>
                  <p className="text-xs text-slate-500">Rajista: ₦{Number(job.registration_fee).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Lokaci: {job.timeline}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className={job.is_active ? 'text-green-600 font-bold' : 'text-slate-400'}>
                    {job.is_active ? '● Yana Kan Shafi' : 'An Rufe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}