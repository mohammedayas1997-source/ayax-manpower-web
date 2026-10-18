'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const defaultJobs = [
    {
      id: 1,
      title: 'Commercial & Heavy Fleet Drivers',
      country: 'Saudi Arabia',
      salary_range: '2,500 - 3,200 SAR',
      registration_fee: 15000,
      timeline: '2 - 3 Months',
      tag: 'Immediate Mobilization'
    },
    {
      id: 2,
      title: 'Healthcare Assistant (Care Worker)',
      country: 'United Kingdom (UK)',
      salary_range: '£23,200 - £26,000 / year',
      registration_fee: 25000,
      timeline: '3 - 5 Months',
      tag: 'Tier-2 Sponsorship'
    },
    {
      id: 3,
      title: 'Warehouse & Logistics Operatives',
      country: 'Poland (Europe)',
      salary_range: '4,200 - 5,000 PLN',
      registration_fee: 20000,
      timeline: '4 - 6 Months',
      tag: 'Schengen Work Permit'
    },
    {
      id: 4,
      title: 'Facilities, Maintenance & Security Crew',
      country: 'Qatar',
      salary_range: '1,800 - 2,500 QAR + Lodging',
      registration_fee: 15000,
      timeline: '2 - 3 Months',
      tag: 'Full Accommodation'
    },
    {
      id: 5,
      title: 'Certified Welder & MEP Technicians',
      country: 'United Arab Emirates (UAE)',
      salary_range: '2,800 - 3,800 AED',
      registration_fee: 15000,
      timeline: '1 - 2 Months',
      tag: 'Direct Employment Visa'
    },
    {
      id: 6,
      title: 'Agricultural & Farm Fleet Workers',
      country: 'Romania (Europe)',
      salary_range: '850 - 1,100 EUR',
      registration_fee: 20000,
      timeline: '3 - 4 Months',
      tag: 'European Contract'
    }
  ];

  const defaultStories = [
    {
      name: 'Ibrahim Sani',
      origin: 'Dala, Kano',
      role: 'Heavy Fleet Transport Driver',
      destination: 'Riyadh, Saudi Arabia',
      image_url: '/candidates/sani.jpg',
      quote: 'Passed my trade driving and biometric assessment at the Kano office. Currently deployed with an established logistics fleet in Riyadh with full accommodation provided.'
    },
    {
      name: 'Fatima Zahra Abdullahi',
      origin: 'Nasarawa, Kano',
      role: 'Registered Healthcare Assistant',
      destination: 'Birmingham, United Kingdom',
      image_url: '/candidates/fatima.jpg',
      quote: 'My clinical documentation and Tier-2 sponsorship visa were completed within 12 weeks. AYAX operates with complete transparency and integrity.'
    },
    {
      name: 'Mustapha Bello',
      origin: 'Fagge, Kano',
      role: 'Certified 6G Pipeline Welder',
      destination: 'Abu Dhabi, UAE',
      image_url: '/candidates/mustapha.jpg',
      quote: 'Completed my trade workshop test at the Kano operations desk. GAMCA medical clearance was verified swiftly, and my employment contract arrived on schedule.'
    },
    {
      name: 'Amina Umar',
      origin: 'Gwale, Kano',
      role: 'Senior Care Specialist',
      destination: 'Manchester, United Kingdom',
      image_url: '/candidates/amina.jpg',
      quote: 'All credential verification and consular briefings were handled thoroughly in Kano. I am now working full-time under direct NHS-approved sponsorship.'
    },
    {
      name: 'Aliyu Danladi',
      origin: 'Tarauni, Kano',
      role: 'Warehouse & Logistics Lead',
      destination: 'Warsaw, Poland',
      image_url: '/candidates/aliyu.jpg',
      quote: 'Secured an official European Schengen work permit through AYAX. The operations team guided me through consular submission until my arrival in Europe.'
    },
    {
      name: 'Zainab Garba',
      origin: 'Bichi, Kano',
      role: 'Hospitality & Catering Coordinator',
      destination: 'Doha, Qatar',
      image_url: '/candidates/zainab.jpg',
      quote: 'Awarded a 2-year verified employment contract with a premier hospitality group in Doha, inclusive of flights, visa clearance, and corporate accommodation.'
    },
    {
      name: 'Abubakar Sadik',
      origin: 'Gwarzo, Kano',
      role: 'Commercial Trailer Operator',
      destination: 'Jeddah, Saudi Arabia',
      image_url: '/candidates/abubakar.jpg',
      quote: 'Transitioned from regional heavy trucking in Northern Nigeria to an international logistics fleet in Jeddah. Verified contract with fair overtime pay.'
    },
    {
      name: 'Maryam Kabir',
      origin: 'Kano Municipal',
      role: 'Customer Relations Officer',
      destination: 'Dubai, UAE',
      image_url: '/candidates/maryam.jpg',
      quote: 'The pre-departure orientation program prepared me thoroughly for corporate culture, labor laws, and professional life across the UAE.'
    },
    {
      name: 'Mansur Lawan',
      origin: 'Dawakin Kudu, Kano',
      role: 'Industrial Electrician & MEP Tech',
      destination: 'Dammam, Saudi Arabia',
      image_url: '/candidates/mansur.jpg',
      quote: 'My trade certification was verified directly by the overseas employer. Mobilization took just under 75 days from initial document upload.'
    },
    {
      name: 'Khadija Sanusi',
      origin: 'Ungogo, Kano',
      role: 'Clinical Support Assistant',
      destination: 'Leeds, United Kingdom',
      image_url: '/candidates/khadija.jpg',
      quote: 'The entire recruitment pipeline was ethical, structured, and free of hidden charges. AYAX fulfilled every contractual promise made at the Kano office.'
    }
  ];

  const [jobs, setJobs] = useState(defaultJobs);
  const [stories, setStories] = useState(defaultStories);

  useEffect(() => {
    async function fetchPlatformData() {
      try {
        const { data: dbJobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbJobs && dbJobs.length > 0) {
          setJobs(dbJobs);
        }

        const { data: dbStories } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (dbStories && dbStories.length > 0) {
          setStories(dbStories);
        }
      } catch (err) {
        console.error('Data synchronization notice:', err);
      }
    }

    fetchPlatformData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Corporate Strip */}
      <div className="bg-[#091e32] text-slate-300 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-4 items-center">
            <span>CAC RC: 9345377</span>
            <span>TIN: 2620247919304</span>
            <span className="hidden md:inline">Office: Suite C13 & C14, Yam Musa Plaza, Kano State, Nigeria</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="mailto:ayaxglobalv@gmail.com" className="text-slate-300 hover:text-white transition">
              ayaxglobalv@gmail.com
            </a>
            <div className="flex items-center gap-2">
              <a href="https://wa.me/2348161444444" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-white font-semibold">
                +234 816 144 4444
              </a>
              <span className="text-white/30">|</span>
              <a href="tel:+2347087244444" className="text-sky-400 hover:text-white font-semibold">
                +234 708 724 4444
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="AYAX Global Logo" 
              className="h-10 w-auto object-contain rounded-md"
            />
            <div>
              <span className="text-lg font-black tracking-tight text-[#0a2540] block leading-tight">AYAX GLOBAL</span>
              <span className="text-[10px] tracking-widest text-slate-500 font-bold uppercase block">Manpower & International Placement</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition">
              Register Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a2540] via-[#0e345a] to-[#091e32] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-sky-400 text-xs font-semibold mb-6">
              <span>Cross-Border Workforce Pipelines &bull; Verified Deployment</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Legitimate Pathways to Overseas Careers in <span className="text-sky-400">Europe & Gulf Corridors</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              We connect disciplined, vetted African professionals with licensed foreign employers across the UAE, Saudi Arabia, Qatar, the United Kingdom, and Eastern Europe.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link href="/register" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
                Candidate Portal: Apply for Jobs
              </Link>
              <Link href="/register" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm rounded-xl transition">
                Employer Portal: Request Quota
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 h-44 sm:h-52 group">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80" 
                  alt="Industrial Trade" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold">Welders & HVAC Technicians</span>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 h-36 sm:h-44 group">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" 
                  alt="Logistics & Transport" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold">Warehousing & Drivers</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 h-36 sm:h-44 group">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80" 
                  alt="Healthcare Personnel" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold">Healthcare & Caregivers</span>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 h-44 sm:h-52 group">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" 
                  alt="Hospitality and Facilities" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold">Hospitality & Facilities</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Deployment Corridors */}
      <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <span className="text-[#0a2540] font-bold uppercase tracking-wider">Active Employment Corridors:</span>
          <div className="flex flex-wrap gap-2">
            {['United Kingdom', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Poland', 'Romania', 'Kuwait', 'Oman'].map((corridor, idx) => (
              <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-700 shadow-2xs font-semibold">
                {corridor}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Deployment Quotas</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] mt-1">Featured International Vacancies</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Transparent processing fees, verified salary packages, and authentic overseas work permits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">
                    {job.country}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {job.timeline || '2 - 3 Months'}
                  </span>
                </div>
                <h3 className="font-bold text-[#0a2540] text-base mb-2">{job.title}</h3>
                <p className="text-xs font-bold text-slate-700 mb-4">Estimated Salary: {job.salary_range || job.salary}</p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 mb-6">
                  <div className="flex justify-between">
                    <span>Registration & Audit Fee:</span>
                    <strong className="text-slate-900">₦{Number(job.registration_fee || job.regFee || 15000).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quota Feature:</span>
                    <span className="text-blue-600 font-semibold">{job.tag || 'Direct Work Visa'}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs rounded-xl text-center transition block"
              >
                Apply via Candidate Portal &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Video Media Showcase */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Media Showcase & Briefings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Pre-Departure Orientation & Training</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Watch candidate screening sessions, trade test assessments, and consular briefings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="aspect-video w-full bg-black relative">
                <iframe 
                  className="w-full h-full"
                  src="https://youtu.be/QRHrHFbBiT4?list=PLebew5L43Bpg&t=4" 
                  title="AYAX Candidate Orientation Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <span className="text-sky-400 text-[11px] font-bold uppercase">Orientation Briefing</span>
                <h3 className="text-base font-bold text-white mt-1">International Workplace & Cultural Preparation</h3>
                <p className="text-xs text-slate-300 mt-1">Equipping deployed personnel with safety guidelines, legal standards, and professional workplace expectations.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="aspect-video w-full bg-black relative">
                <iframe 
                  className="w-full h-full"
                  src="https://youtu.be/DHS-XsZhoJQ?t=84" 
                  title="Trade Skill Evaluation Desk"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <span className="text-sky-400 text-[11px] font-bold uppercase">Field Assessment</span>
                <h3 className="text-base font-bold text-white mt-1">Technical Skills & Trade Test Evaluations</h3>
                <p className="text-xs text-slate-300 mt-1">Rigorous trade examinations conducted at our Kano technical center to ensure compliance with overseas employer requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Verified Deployments</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] mt-1">Candidate Success Stories</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Meet candidates successfully audited, processed, and deployed across international employment corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, idx) => (
            <div key={story.id || idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img 
                    src={story.image_url || story.image} 
                    alt={story.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-[#0a2540] text-sm leading-tight">{story.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{story.role}</p>
                    <span className="text-[11px] text-slate-500 block">
                      Origin: <strong className="text-slate-700">{story.origin}</strong>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      📍 {story.destination}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{story.quote}"
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                  ✓ Active Deployment Contract
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Trust Metrics */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-extrabold text-[#0a2540] mb-2">100%</div>
            <div className="text-sm font-bold text-slate-800 mb-1">Biometric Verification</div>
            <p className="text-xs text-slate-500">Every passport and police clearance certificate is audited before presentation to foreign employers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-extrabold text-[#0a2540] mb-2">2,500+</div>
            <div className="text-sm font-bold text-slate-800 mb-1">Mobilized Talent Roster</div>
            <p className="text-xs text-slate-500">Supplying disciplined, skilled, and work-ready candidates ready for rapid deployment quotas.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-extrabold text-[#0a2540] mb-2">8+ Corridors</div>
            <div className="text-sm font-bold text-slate-800 mb-1">Direct Employer Ties</div>
            <p className="text-xs text-slate-500">Active corporate partnerships with authorized staffing agencies and companies in the GCC and Europe.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#091e32] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="/logo.png" 
                alt="AYAX Global Logo" 
                className="h-10 w-auto object-contain rounded-md bg-white p-1"
              />
              <div>
                <div className="text-white font-bold text-sm">AYAX GLOBAL MANPOWER RECRUITMENT</div>
                <span className="text-[11px] text-slate-400">RC: 9345377 &bull; TIN: 2620247919304</span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              An official division of AYAX GLOBAL VENTURES LTD. Registered with the Corporate Affairs Commission (CAC) of the Federal Republic of Nigeria.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-2">Operational Hub</div>
            <p className="text-slate-300">Suite C13 & C14, Yam Musa Plaza,</p>
            <p className="text-slate-300">Kano State, Nigeria.</p>
            <p className="pt-1">
              Email: <a href="mailto:ayaxglobalv@gmail.com" className="text-sky-400 hover:text-white transition">ayaxglobalv@gmail.com</a>
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-2">Support & Verification Desks</div>
            <p>
              Desk 1 (WhatsApp):{' '}
              <a href="https://wa.me/2348161444444" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-white font-semibold">
                +234 816 144 4444
              </a>
            </p>
            <p>
              Desk 2 (Direct):{' '}
              <a href="tel:+2347087244444" className="text-sky-400 hover:text-white font-semibold">
                +234 708 724 4444
              </a>
            </p>
            <div className="pt-2 flex gap-4">
              <Link href="/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/register" className="hover:text-white transition">Register</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
          <p>&copy; {new Date().getFullYear()} AYAX Global Ventures Ltd. All rights reserved.</p>
          <p>Authorized Cross-Border Recruitment Operations Desk</p>
        </div>
      </footer>
    </div>
  );
}