'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';
import jsPDF from 'jspdf';

// PDF Receipt Generator Function
const generateReceiptPDF = ({ paymentRef, candidateName, candidateEmail, passportNo, jobTitle, country, amountPaid }) => {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(10, 37, 64);
  doc.rect(0, 0, 210, 42, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AYAX GLOBAL MANPOWER VENTURES', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('International Workforce Deployment & Verification Desk | RC: 9345377', 14, 28);
  doc.text('Operational Hub: Yammusa Plaza, Kano, Nigeria | Tel: +234 816 144 4444', 14, 34);

  // Receipt Badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 37, 64);
  doc.text('OFFICIAL PAYMENT RECEIPT', 14, 56);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 60, 196, 60);

  // Metadata Grid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Payment Reference:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(paymentRef), 65, 70);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Date:', 14, 78);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleString(), 65, 78);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Status:', 14, 86);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('CONFIRMED / PAID', 65, 86);

  // Candidate Section
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 94, 196, 94);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 37, 64);
  doc.text('Candidate Credentials', 14, 104);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Full Legal Name:', 14, 114);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(candidateName || 'N/A'), 65, 114);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Email Address:', 14, 122);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(candidateEmail || 'N/A'), 65, 122);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Passport Number:', 14, 130);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(passportNo || 'N/A'), 65, 130);

  // Application Item Table
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 142, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('SERVICE DESCRIPTION', 18, 148);
  doc.text('DESTINATION', 120, 148);
  doc.text('AMOUNT (NGN)', 160, 148);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Candidate Verification Fee (${jobTitle})`, 18, 160);
  doc.text(String(country || 'Overseas'), 120, 160);
  doc.setFont('helvetica', 'bold');
  doc.text(`NGN ${Number(amountPaid).toLocaleString()}`, 160, 160);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 168, 196, 168);

  // Total Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 37, 64);
  doc.text('Total Amount Paid:', 110, 178);
  doc.setTextColor(22, 163, 74);
  doc.text(`NGN ${Number(amountPaid).toLocaleString()}`, 160, 178);

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated confirmation receipt issued by AYAX Global Manpower Ventures.', 14, 260);
  doc.text('Payment covers candidate profiling, credential audit, and overseas employer quota presentation.', 14, 266);

  doc.save(`AYAX_Receipt_${paymentRef}.pdf`);
};

// Sub-Component: Job Card with Paystack & Instant Receipt Download
function JobApplicationCard({ job, user, profile, onApplicationComplete }) {
  const fee = Number(job.registration_fee || 15000);
  const amountInKobo = fee * 100;

  const paystackConfig = {
    reference: `AYAX_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    email: user?.email || '',
    amount: amountInKobo,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_sample',
    metadata: {
      candidate_id: user?.id,
      candidate_name: profile?.full_name,
      job_id: job.id,
      job_title: job.title,
      passport_number: profile?.passport_number || 'N/A',
    },
  };

  const triggerPayment = usePaystackPayment(paystackConfig);

  const handleApplyClick = () => {
    if (!profile?.cv_url || !profile?.passport_data_page_url) {
      alert('Please upload your CV and International Passport Data Page first.');
      return;
    }

    triggerPayment(
      async (reference) => {
        try {
          const { error } = await supabase.from('applications').insert([
            {
              candidate_id: user.id,
              job_id: job.id,
              payment_status: 'paid',
              processing_status: 'pending',
            },
          ]);

          if (error) throw error;

          alert(`Application submitted! Reference: ${reference.reference}`);

          generateReceiptPDF({
            paymentRef: reference.reference,
            candidateName: profile?.full_name,
            candidateEmail: user?.email,
            passportNo: profile?.passport_number,
            jobTitle: job.title,
            country: job.country,
            amountPaid: fee,
          });

          if (onApplicationComplete) onApplicationComplete();
        } catch (err) {
          alert('Payment recorded but submission failed: ' + err.message);
        }
      },
      () => {
        alert('Payment process was cancelled.');
      }
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
            {job.country}
          </span>
          <span className="text-xs text-slate-400 font-medium">{job.timeline || '2-3 Months'}</span>
        </div>
        <h3 className="font-bold text-[#0a2540] text-base mb-1">{job.title}</h3>
        <p className="text-xs text-slate-600 mb-3 font-semibold">Salary: {job.salary_range}</p>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Registration & Verification Fee:</span>
            <strong className="text-slate-800">NGN {fee.toLocaleString()}</strong>
          </div>
          {job.processing_details && (
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              {job.processing_details}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleApplyClick}
        className="w-full py-2.5 bg-[#16a34a] hover:bg-green-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>Pay NGN {fee.toLocaleString()} & Submit Application</span>
      </button>
    </div>
  );
}

// Sub-Component: Post-Deployment Testimonial Form
function CandidateTestimonialSection({ user, profile }) {
  const [role, setRole] = useState(profile?.profession || '');
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState(profile?.state || 'Kano, Nigeria');
  const [quote, setQuote] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !quote || !destination || !role) {
      alert('Please fill in all fields and select your workplace photo.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `candidates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('testimonials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('testimonials')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([
          {
            candidate_id: user.id,
            name: profile?.full_name || 'Verified Candidate',
            origin: origin,
            role: role,
            destination: destination,
            quote: quote,
            image_url: publicUrl,
            is_approved: false,
          }
        ]);

      if (insertError) throw insertError;

      setMessage('Success! Your testimonial has been submitted for administrative review.');
      setQuote('');
      setFile(null);
    } catch (err) {
      setMessage(`Submission Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Post-Deployment Feedback</span>
        <h3 className="text-lg font-extrabold text-[#0a2540]">Share Your International Placement Story</h3>
        <p className="text-xs text-slate-500 mt-1">
          Have you been placed abroad? Submit your photo and working experience to inspire new candidates.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold mb-6 ${
          message.startsWith('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
            <input
              type="text"
              placeholder="e.g. Commercial Heavy Driver"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
            <input
              type="text"
              placeholder="e.g. Riyadh, Saudi Arabia"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Local Origin</label>
            <input
              type="text"
              placeholder="e.g. Dala, Kano"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Workplace / Field Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Statement / Experience</label>
          <textarea
            rows="3"
            placeholder="Share feedback on your visa issuance, employer orientation, and workplace environment..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            required
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-3 bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
        >
          {uploading ? 'Submitting Testimonial...' : 'Submit Story for Verification &rarr;'}
        </button>
      </form>
    </div>
  );
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [cvFile, setCvFile] = useState(null);
  const [passportPageFile, setPassportPageFile] = useState(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState(null);
  const [passportNo, setPassportNo] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const { data: { session }, error: authErr } = await supabase.auth.getSession();
      if (authErr || !session) {
        router.push('/login');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (profileData.passport_number) {
          setPassportNo(profileData.passport_number);
        }
      }

      // Fetch Applications with Job Details
      const { data: appsData } = await supabase
        .from('applications')
        .select('*, jobs(title, country, registration_fee, salary_range)')
        .eq('candidate_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (appsData) {
        setMyApplications(appsData);
      }

      // Fetch Active Openings
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (jobsData) {
        setJobs(jobsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadToStorage = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMsg({ type: '', text: '' });

    try {
      const updates = {
        passport_number: passportNo,
        updated_at: new Date().toISOString(),
      };

      if (cvFile) {
        updates.cv_url = await uploadToStorage(cvFile, 'cv');
      }
      if (passportPageFile) {
        updates.passport_data_page_url = await uploadToStorage(passportPageFile, 'passport_data_page');
      }
      if (passportPhotoFile) {
        updates.passport_photo_url = await uploadToStorage(passportPhotoFile, 'passport_photo');
      }

      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMsg({ type: 'success', text: 'Credentials uploaded and synchronized successfully.' });
      fetchInitialData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to upload credentials.' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Helper Badge for Application Stages
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">Under Review / Processing</span>;
      case 'verified':
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">Credentials Approved</span>;
      case 'deployed':
      case 'hired':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">✓ Deployed / Placed</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">Application Rejected</span>;
      case 'pending':
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">Pending Review</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-semibold text-sm">Loading Candidate Portal Desk...</div>
      </div>
    );
  }

  const hasPlacedJob = myApplications.some(app => app.processing_status === 'deployed' || app.processing_status === 'hired');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#0a2540]">AYAX Candidate Portal</h1>
            <p className="text-xs text-slate-500">Welcome, {profile?.full_name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Document Upload Left Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#0a2540]">Profile Credentials</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                profile?.verification_status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {profile?.verification_status || 'Pending'}
              </span>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-lg text-xs mb-4 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">International Passport Number</label>
                <input
                  type="text"
                  required
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value)}
                  placeholder="e.g. A12345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CV / Resume (PDF) {profile?.cv_url && <span className="text-emerald-600 font-semibold">✓ Uploaded</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passport Data Page {profile?.passport_data_page_url && <span className="text-emerald-600 font-semibold">✓ Uploaded</span>}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPassportPageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passport Photograph {profile?.passport_photo_url && <span className="text-emerald-600 font-semibold">✓ Uploaded</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPassportPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition disabled:bg-slate-300"
              >
                {uploading ? 'Synchronizing Credentials...' : 'Save & Update Credentials'}
              </button>
            </form>
          </div>

          {/* Right Column: Tracked Applications & Available Openings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Submitted Applications Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-[#0a2540] mb-1">My Applications & Deployment Tracking</h2>
              <p className="text-xs text-slate-500 mb-4">Real-time status updates from our administrative and consular review desk.</p>

              {myApplications.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  You have not submitted an application yet. Browse available quotas below.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-3">Applied Role</th>
                        <th className="p-3">Country</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Deployment Stage</th>
                        <th className="p-3">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-800">{app.jobs?.title}</td>
                          <td className="p-3 text-slate-600">{app.jobs?.country}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              {app.payment_status}
                            </span>
                          </td>
                          <td className="p-3">
                            {renderStatusBadge(app.processing_status)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => generateReceiptPDF({
                                paymentRef: `AYAX-APP-${app.id.substring(0, 8)}`,
                                candidateName: profile?.full_name,
                                candidateEmail: user?.email,
                                passportNo: profile?.passport_number,
                                jobTitle: app.jobs?.title,
                                country: app.jobs?.country,
                                amountPaid: app.jobs?.registration_fee || 15000,
                              })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition inline-flex items-center gap-1"
                            >
                              PDF Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Testimonial Section (Unlocked for Candidates with Active Deployments) */}
            {hasPlacedJob && (
              <CandidateTestimonialSection user={user} profile={profile} />
            )}

            {/* Available Openings Grid */}
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-[#0a2540]">Available International Openings</h2>
                <p className="text-xs text-slate-500">Verified workforce quotas across Europe and the Gulf Cooperation Council (GCC).</p>
              </div>

              {jobs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                  No open job quotas posted at the moment. Please check back shortly.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobApplicationCard
                      key={job.id}
                      job={job}
                      user={user}
                      profile={profile}
                      onApplicationComplete={fetchInitialData}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}