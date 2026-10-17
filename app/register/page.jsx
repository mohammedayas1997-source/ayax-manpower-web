'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('candidate'); // 'candidate' ko 'employer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Bayanan Candidate
  const [fullName, setFullName] = useState('');
  
  // Bayanan Employer
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Yi Sign Up a Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        // 2. Adana ainihin bayanan mai amfani a teburin users
        const { error: userTableError } = await supabase.from('users').insert([
          {
            id: userId,
            email,
            phone,
            role,
          },
        ]);

        if (userTableError) throw userTableError;

        // 3. Adana bayanan profile dangane da role din da ya zaba
        if (role === 'candidate') {
          const { error: candError } = await supabase.from('candidate_profiles').insert([
            {
              id: userId,
              full_name: fullName,
              verification_status: 'pending',
            },
          ]);
          if (candError) throw candError;
        } else if (role === 'employer') {
          const { error: empError } = await supabase.from('employer_profiles').insert([
            {
              id: userId,
              company_name: companyName,
              country,
              contact_person: contactPerson,
              is_verified: false,
            },
          ]);
          if (empError) throw empError;
        }

        alert('Account created successfully!');
        router.push('/login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#0a2540]">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Join AYAX Global Manpower Portal</p>
        </div>

        {/* Zaban Role (Candidate ko Company) */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
              role === 'candidate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-dark'
            }`}
          >
            Candidate (Job Seeker)
          </button>
          <button
            type="button"
            onClick={() => setRole('employer')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
              role === 'employer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-dark'
            }`}
          >
            Company / Employer
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Fannonin Candidate */}
          {role === 'candidate' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (As in Passport)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Fannonin Employer */}
          {role === 'employer' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Agency Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Al-Mansoor Facilities LLC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country Base</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="UAE, Saudi, UK..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="HR Director"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Bayanan gama gari */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 mt-2 disabled:bg-slate-400"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}