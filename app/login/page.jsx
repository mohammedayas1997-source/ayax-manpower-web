'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates');

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

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

      const user = session.user;
      let userRole = user?.user_metadata?.role || null;

      if (!userRole) {
        const { data: profileData } = await supabase
          .from('candidate_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.role) {
          userRole = profileData.role;
        }
      }

      if (!userRole) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userData?.role) {
          userRole = userData.role;
        }
      }

      const normalizedRole = (userRole || '').toLowerCase();

      if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin' && normalizedRole !== 'staff') {
        alert('Access Denied: Admins & Staff only.');
        router.push('/login');
        return;
      }

      await loadDashboardData();
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
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
  };

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

      setFeedbackMsg({ type: 'success', text: 'New job vacancy successfully published!' });
      setJobTitle('');
      setCountry('');
      setSalaryRange('');
      setTimeline('');
      setProcessingDetails('');
      loadDashboardData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error publishing job' });
    } finally {
      setPostingJob(false);
    }
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({ verification_status: newStatus })
        .eq('id', candidateId);

      if (error) throw error;
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm font-bold text-slate-600">Initializing Admin Control Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-[#0a2540] text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-extrabold tracking-wide">AYAX GLOBAL | Control Desk</h1>
          <p className="text-xs text-slate-300">Executive Administration & Verification Operations</p>
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
            Applicants & Documentation ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('post-job')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'post-job'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            + Post New Job Vacancy
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'jobs'
                ? 'bg-[#0a2540] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Active Portal Vacancies ({jobs.length})
          </button>
        </div>

        {activeTab === 'candidates' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">Candidate Verification & Auditing Pipeline</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Passport Number</th>
                    <th className="p-3">Uploaded Verification Credentials</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">
                        No candidate documentation available for review yet.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{cand.full_name || 'No Name Provided'}</div>
                          <div className="text-[11px] text-slate-500">{cand.email || cand.phone || cand.id}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {cand.passport_number || 'Not Stated'}
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
                                Download CV / Resume
                              </a>
                            ) : (
                              <span className="text-slate-400">CV: Not Uploaded</span>
                            )}

                            {cand.passport_data_page_url ? (
                              <a
                                href={cand.passport_data_page_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                View Passport Data Page
                              </a>
                            ) : (
                              <span className="text-slate-400">Passport: Not Uploaded</span>
                            )}

                            {cand.passport_photo_url ? (
                              <a
                                href={cand.passport_photo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                View Passport Photograph
                              </a>
                            ) : (
                              <span className="text-slate-400">Photo: Not Uploaded</span>
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
                              Verify
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(cand.id, 'rejected')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition"
                            >
                              Reject
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

        {activeTab === 'post-job' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm mx-auto">
            <h2 className="text-base font-bold text-[#0a2540] mb-1">Post New Job Vacancy</h2>
            <p className="text-xs text-slate-500 mb-4">This vacancy will be published immediately to candidates on the platform.</p>

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
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Heavy Duty Fleet Driver"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Saudi Arabia, UAE, Poland"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Salary Range *</label>
                  <input
                    type="text"
                    required
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. 2,500 - 3,500 SAR / month"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration & Audit Fee (₦) *</label>
                  <input
                    type="number"
                    required
                    value={regFee}
                    onChange={(e) => setRegFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Processing Timeline *</label>
                  <input
                    type="text"
                    required
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 2 - 3 Months"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Processing Terms & Quota Specifications</label>
                <textarea
                  rows="3"
                  value={processingDetails}
                  onChange={(e) => setProcessingDetails(e.target.value)}
                  placeholder="Details regarding visa quota, accommodation, air ticket, and medical clearance..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={postingJob}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-slate-400"
              >
                {postingJob ? 'Publishing Vacancy...' : 'Publish Vacancy to Platform'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {job.country}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">Salary: {job.salary_range}</p>
                  <p className="text-xs text-slate-500">Registration Fee: ₦{Number(job.registration_fee).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Timeline: {job.timeline}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className={job.is_active ? 'text-green-600 font-bold' : 'text-slate-400'}>
                    {job.is_active ? '● Active on Portal' : 'Archived'}
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