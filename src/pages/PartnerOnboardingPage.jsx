import React, { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import Button from '../components/Button';

// SVG Icons
const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const WhatsAppGlyph = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.19 8.19 0 01-5.82 2.41c-1.45 0-2.88-.38-4.14-1.11l-.3-.18-3.12.82.83-3.04-.19-.31a8.167 8.167 0 01-1.24-4.42c0-4.54 3.69-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z" />
  </svg>
);

const EmailGlyph = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const OtherChannelGlyph = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// Email Frequency Options
const EMAIL_FREQUENCIES = [
  {
    id: 'multiple_per_day',
    label: 'Multiple times a day',
    tag: 'Real-time',
    detail: 'Continuous monitoring throughout the workday.'
  },
  {
    id: 'every_morning',
    label: 'Every morning',
    tag: 'Morning',
    detail: 'Processed at the start of the academic/administrative day.'
  },
  {
    id: 'once_a_day',
    label: 'Once a day',
    tag: 'Dedicated Block',
    detail: 'A focused review window once daily.'
  },
  {
    id: 'every_evening',
    label: 'Every evening',
    tag: 'Evening',
    detail: 'Reviewed at the close of daily operations.'
  },
  {
    id: 'few_times_week',
    label: 'A few times a week',
    tag: 'Periodic',
    detail: 'Checked periodically every couple of days.'
  },
];

// Contribution options
const CONTRIBUTION_OPTIONS = [
  'Mentorship',
  'Networking',
  'Publicity',
  'Expertise',
  'Other'
];

// Sponsorship Duration options
const DURATION_OPTIONS = [
  '1 month',
  '3 months',
  '6 months',
  '12 months',
  'Other'
];

// Referral Options
const REFERRAL_OPTIONS = [
  'Social media',
  'Friend / referral',
  'SS4 event',
  'Other'
];

// Quick Naira Presets
const SPONSORSHIP_PRESETS = [
  '25,000',
  '50,000',
  '100,000',
  '250,000',
  '500,000'
];

// Time Windows
const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning (08:00 – 12:00)' },
  { id: 'afternoon', label: 'Afternoon (12:00 – 16:00)' },
  { id: 'evening', label: 'Evening (16:00 – 19:00)' },
];

export default function PartnerOnboardingPage() {
  const otherContactId = useId();
  const otherContribId = useId();
  const otherDurationId = useId();
  const otherReferralId = useId();

  // Form State
  const [formData, setFormData] = useState({
    // Section 1: About You
    fullName: '',
    stateOfResidence: 'Lagos State',
    phone: '',
    email: '',
    profession: '',
    organization: '',
    socialProfile: '',

    // Section 2: Communication Preferences (Crucial user questions)
    preferredMeans: 'whatsapp', // 'whatsapp' | 'email' | 'other'
    preferredMeansOtherText: '',
    emailFrequency: 'once_a_day',
    preferredTimeWindow: 'morning',

    // Section 3: Your Partnership
    interestsText: '',
    contributions: ['Mentorship', 'Networking'],
    contributionOtherText: '',

    // Section 4: SCL Monthly Sponsorship
    sponsorshipAmount: '50,000',
    sponsorshipDuration: '3 months',
    durationOtherText: '',

    // Section 5: Recognition & Final Details
    publicRecognition: 'yes', // 'yes' | 'no'
    recognitionName: '',
    referralSource: 'Social media',
    referralOtherText: '',
    additionalNotes: '',

    // Section 6: Confirmation
    confirmationName: '',
    confirmationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [referenceCode, setReferenceCode] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleContribution = (item) => {
    setFormData((prev) => {
      const exists = prev.contributions.includes(item);
      return {
        ...prev,
        contributions: exists
          ? prev.contributions.filter((c) => c !== item)
          : [...prev.contributions, item],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please provide a contact phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (formData.preferredMeans === 'other' && !formData.preferredMeansOtherText.trim()) {
      toast.error('Please specify your alternative preferred means of being reached.');
      return;
    }

    setIsSubmitting(true);
    const ref = `SS4-PRT-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      reference_code: ref,
      full_name: formData.fullName.trim(),
      state_of_residence: formData.stateOfResidence.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      profession: formData.profession.trim(),
      organization: formData.organization.trim(),
      social_profile: formData.socialProfile.trim(),
      preferred_contact_method: formData.preferredMeans,
      preferred_contact_method_other: formData.preferredMeans === 'other' ? formData.preferredMeansOtherText.trim() : null,
      email_frequency: formData.emailFrequency,
      preferred_time_window: formData.preferredTimeWindow,
      partnership_interests: formData.interestsText.trim(),
      contributions: formData.contributions,
      contribution_other: formData.contributions.includes('Other') ? formData.contributionOtherText.trim() : null,
      sponsorship_amount_monthly: formData.sponsorshipAmount,
      sponsorship_duration: formData.sponsorshipDuration,
      sponsorship_duration_other: formData.sponsorshipDuration === 'Other' ? formData.durationOtherText.trim() : null,
      public_recognition: formData.publicRecognition === 'yes',
      recognition_name: formData.publicRecognition === 'yes' ? (formData.recognitionName.trim() || formData.fullName.trim()) : null,
      referral_source: formData.referralSource,
      referral_source_other: formData.referralSource === 'Other' ? formData.referralOtherText.trim() : null,
      additional_notes: formData.additionalNotes.trim(),
      confirmation_name: formData.confirmationName.trim() || formData.fullName.trim(),
      confirmation_date: formData.confirmationDate,
      created_at: new Date().toISOString(),
    };

    // Store in localStorage for complete persistence
    try {
      const records = JSON.parse(localStorage.getItem('ss4_partner_offers') || '[]');
      records.unshift(payload);
      localStorage.setItem('ss4_partner_offers', JSON.stringify(records));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    // Try Supabase insert gracefully
    try {
      const { error } = await supabase.from('partner_offers').insert([payload]);
      if (error) {
        console.info('[PartnerOffer] Supabase table pending or unavailable, stored in session:', error.message);
      }
    } catch (err) {
      console.info('[PartnerOffer] Supabase fallback handled:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setReferenceCode(ref);
      setSubmittedData(formData);
      toast.success('Registration submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleCopyRef = () => {
    if (!referenceCode) return;
    navigator.clipboard.writeText(referenceCode);
    setCopiedRef(true);
    toast.info('Reference copied to clipboard');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="w-full bg-[#F6F4F0] min-h-screen py-10 md:py-16 px-4 sm:px-6 text-[#1B2433] selection:bg-[#1559B2] selection:text-white">
      <main className="max-w-[740px] mx-auto bg-white rounded-3xl p-6 sm:p-10 md:p-14 border border-[#B9C4D6]/70 shadow-xs">
        
        {/* Submitted Receipt View */}
        {submittedData ? (
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo */}
            <img
              src="/ss4_logo.jpg"
              alt="SS4 Chess League"
              className="h-12 sm:h-14 w-auto object-contain mb-5"
            />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-space uppercase tracking-wider mb-3">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Partnership Form Registered</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-space font-black text-[#1559B2] leading-tight mb-2">
              Thank You, {submittedData.fullName || 'Partner'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Your official partnership registration for the SS4 Chess League has been logged. Our partnership directorate will review your dossier and initiate the onboarding protocol.
            </p>

            {/* Reference Card */}
            <div className="bg-[#FAF8F4] border border-[#B9C4D6] rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-space font-extrabold uppercase tracking-wider text-gray-500 block mb-0.5">
                  Registration Reference Code
                </span>
                <span className="font-space text-2xl font-black text-[#1559B2] tracking-wide">
                  {referenceCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="varsity-btn-secondary py-2 px-5 text-sm min-h-[40px] rounded-xl self-start sm:self-center"
              >
                {copiedRef ? 'Copied' : 'Copy Reference'}
              </button>
            </div>

            {/* Summary Box */}
            <div className="border border-[#B9C4D6]/70 rounded-2xl p-6 mb-8 bg-[#EEF3FB]/40">
              <h2 className="text-xs font-space font-black uppercase tracking-wider text-gray-500 mb-4">
                Dossier Summary
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Monthly Commitment</dt>
                  <dd className="font-space font-black text-lg text-[#C84E00]">
                    ₦{submittedData.sponsorshipAmount || '0'} / month
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Sponsorship Duration</dt>
                  <dd className="font-space font-extrabold text-[#1B2433]">
                    {submittedData.sponsorshipDuration === 'Other'
                      ? submittedData.durationOtherText
                      : submittedData.sponsorshipDuration}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Preferred Contact Channel</dt>
                  <dd className="font-space font-extrabold text-[#1559B2] capitalize">
                    {submittedData.preferredMeans === 'other'
                      ? submittedData.preferredMeansOtherText
                      : submittedData.preferredMeans}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Email Checking Routine</dt>
                  <dd className="font-space font-bold text-[#1B2433]">
                    {EMAIL_FREQUENCIES.find((f) => f.id === submittedData.emailFrequency)?.label || submittedData.emailFrequency}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <Button to="/" variant="primary" size="md">
                Return to SS4 Home
              </Button>
              <Button to="/schools" variant="secondary" size="md">
                Explore Partner Schools
              </Button>
            </div>
          </Motion.div>
        ) : (
          /* Main Registration Form */
          <div>
            {/* Header with Logo */}
            <header className="mb-6">
              <img
                src="/ss4_logo.jpg"
                alt="SS4 Chess League"
                className="h-12 sm:h-14 w-auto object-contain mb-4"
              />
              <h1 className="text-3xl sm:text-4xl font-space font-black text-[#1559B2] leading-tight m-0">
                SS4 Partnership Form
              </h1>
              
              {/* Distinctive Two-tone Rule (66% Blue, 34% Orange) */}
              <div
                className="h-1 w-full my-4 rounded-full"
                style={{ background: 'linear-gradient(90deg, #1559B2 66%, #C84E00 66%)' }}
              />
            </header>

            <form onSubmit={handleSubmit} noValidate>
              
              {/* SECTION 1: About You */}
              <section className="mb-8">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    1
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    About You
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full name <span className="text-[#C84E00]">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder="e.g. Dr. Jane Chukwu"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  {/* State of Residence */}
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      State of residence <span className="text-[#C84E00]">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder="e.g. Lagos State, Nigeria"
                      value={formData.stateOfResidence}
                      onChange={(e) => handleInputChange('stateOfResidence', e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Phone number <span className="text-[#C84E00]">*</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                        placeholder="+234 800 000 0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Email address <span className="text-[#C84E00]">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Profession / Occupation */}
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Profession / occupation
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder="e.g. Architect / University Lecturer / Software Engineer"
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                    />
                  </div>

                  {/* Organization / Business */}
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Organization / business <span className="text-gray-500 font-normal lowercase">(if applicable)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder="e.g. Apex Engineering Ltd / Lagos City Chess Club"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                  </div>

                  {/* Social Profile */}
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Social / professional profile <span className="text-gray-500 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder="e.g. linkedin.com/in/yourprofile or @handle"
                      value={formData.socialProfile}
                      onChange={(e) => handleInputChange('socialProfile', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Communication Preferences (Crucial questions from prompt) */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    2
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    Communication Protocol
                  </h2>
                </div>

                {/* Question 1: Preferred Means */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="font-space text-sm sm:text-base font-black text-[#1B2433]">
                      What is your preferred means of being reached? <span className="text-[#C84E00]">*</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose the primary channel for our direct correspondence.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleInputChange('preferredMeans', 'whatsapp')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        formData.preferredMeans === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-[#1B2433]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <WhatsAppGlyph className={formData.preferredMeans === 'whatsapp' ? 'text-emerald-600' : 'text-gray-500'} />
                        <span className="font-space font-extrabold text-sm">WhatsApp</span>
                      </div>
                      {formData.preferredMeans === 'whatsapp' && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      )}
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => handleInputChange('preferredMeans', 'email')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        formData.preferredMeans === 'email'
                          ? 'border-[#1559B2] bg-[#EEF3FB] text-[#1559B2] ring-1 ring-[#1559B2]'
                          : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-[#1B2433]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <EmailGlyph className={formData.preferredMeans === 'email' ? 'text-[#1559B2]' : 'text-gray-500'} />
                        <span className="font-space font-extrabold text-sm">Email</span>
                      </div>
                      {formData.preferredMeans === 'email' && (
                        <span className="w-4 h-4 rounded-full bg-[#1559B2] text-white flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      )}
                    </button>

                    {/* Other */}
                    <button
                      type="button"
                      onClick={() => handleInputChange('preferredMeans', 'other')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        formData.preferredMeans === 'other'
                          ? 'border-[#C84E00] bg-[#FFEEDB] text-[#C84E00] ring-1 ring-[#C84E00]'
                          : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-[#1B2433]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <OtherChannelGlyph className={formData.preferredMeans === 'other' ? 'text-[#C84E00]' : 'text-gray-500'} />
                        <span className="font-space font-extrabold text-sm">Other</span>
                      </div>
                      {formData.preferredMeans === 'other' && (
                        <span className="w-4 h-4 rounded-full bg-[#C84E00] text-white flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Conditional text entry on Other */}
                  <AnimatePresence>
                    {formData.preferredMeans === 'other' && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2">
                          <label
                            htmlFor={otherContactId}
                            className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1"
                          >
                            Specify your preferred contact channel <span className="text-[#C84E00]">*</span>
                          </label>
                          <input
                            id={otherContactId}
                            type="text"
                            className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors"
                            placeholder="e.g. Phone call, Telegram (@handle), In-person office"
                            value={formData.preferredMeansOtherText}
                            onChange={(e) => handleInputChange('preferredMeansOtherText', e.target.value)}
                            autoFocus
                            required={formData.preferredMeans === 'other'}
                          />
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Question 2: Email Checking Frequency */}
                <div>
                  <label className="font-space text-sm sm:text-base font-black text-[#1B2433] block mb-0.5">
                    How often do you check your email? <span className="text-[#C84E00]">*</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Choose the option that best describes your daily email checking routine so we time our communications when you are most attentive.
                  </p>

                  <div className="space-y-2">
                    {EMAIL_FREQUENCIES.map((freq) => {
                      const isSelected = formData.emailFrequency === freq.id;
                      return (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => handleInputChange('emailFrequency', freq.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#1559B2] bg-[#EEF3FB] text-[#1B2433] ring-1 ring-[#1559B2]'
                              : 'border-[#B9C4D6]/70 bg-[#FAF8F4] hover:bg-white text-[#1B2433]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#1559B2] bg-[#1559B2]' : 'border-gray-400 bg-white'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-space text-sm font-extrabold">{freq.label}</span>
                                <span className={`text-[10px] font-space font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-[#1559B2] text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {freq.tag}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 block">{freq.detail}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred time window */}
                <div className="mt-5">
                  <span className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Preferred window for phone calls / syncs
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {TIME_WINDOWS.map((win) => {
                      const isSelected = formData.preferredTimeWindow === win.id;
                      return (
                        <button
                          key={win.id}
                          type="button"
                          onClick={() => handleInputChange('preferredTimeWindow', win.id)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-space font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1559B2] bg-[#1559B2] text-white'
                              : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-gray-700'
                          }`}
                        >
                          {win.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* SECTION 3: Your Partnership */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    3
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    Your Partnership
                  </h2>
                </div>

                {/* What interests you */}
                <div className="mb-5">
                  <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                    What interests you about partnering with SS4?
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors resize-y"
                    placeholder="Share what drew you to the league, youth scholastic chess, academic excellence..."
                    value={formData.interestsText}
                    onChange={(e) => handleInputChange('interestsText', e.target.value)}
                  />
                </div>

                {/* Beyond sponsorship contributions */}
                <div>
                  <span className="block font-space text-sm font-extrabold text-[#1B2433] mb-1">
                    Beyond sponsorship, how would you like to contribute?
                  </span>
                  <div className="flex flex-wrap gap-2.5 my-3">
                    {CONTRIBUTION_OPTIONS.map((item) => {
                      const isChecked = formData.contributions.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleContribution(item)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer ${
                            isChecked
                              ? 'border-[#1559B2] bg-[#EEF3FB] text-[#1559B2]'
                              : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-gray-700'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                            isChecked ? 'border-[#1559B2] bg-[#1559B2] text-white' : 'border-gray-400 bg-white'
                          }`}>
                            {isChecked && <CheckIcon className="w-3 h-3 stroke-3" />}
                          </span>
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Other contribution specification */}
                  <AnimatePresence>
                    {formData.contributions.includes('Other') && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2">
                          <label
                            htmlFor={otherContribId}
                            className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1"
                          >
                            Specify your other contribution
                          </label>
                          <input
                            id={otherContribId}
                            type="text"
                            className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors"
                            placeholder="e.g. Venue provision, Tournament hardware, Academic prizes"
                            value={formData.contributionOtherText}
                            onChange={(e) => handleInputChange('contributionOtherText', e.target.value)}
                          />
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* SECTION 4: SCL Monthly Sponsorship */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    4
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    SCL Monthly Sponsorship
                  </h2>
                </div>

                {/* Amount */}
                <div className="mb-6">
                  <label className="block font-space text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Intended sponsorship for the SS4 Chess League (SCL) Monthly Games
                  </label>
                  <div className="flex items-baseline gap-2 text-2xl font-black text-[#C84E00] mb-3">
                    <span>₦</span>
                    <input
                      type="text"
                      className="font-space font-black text-2xl bg-transparent border-0 border-b-2 border-[#1559B2] outline-none text-[#1B2433] w-48 sm:w-56 px-0 py-0.5 focus:border-[#C84E00] transition-colors"
                      value={formData.sponsorshipAmount}
                      onChange={(e) => handleInputChange('sponsorshipAmount', e.target.value)}
                      placeholder="50,000"
                    />
                    <small className="text-sm font-semibold text-gray-600 font-avenir">per month</small>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-space font-bold uppercase tracking-wider text-gray-500 mr-1">
                      Quick Select:
                    </span>
                    {SPONSORSHIP_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleInputChange('sponsorshipAmount', preset)}
                        className={`text-xs font-space font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          formData.sponsorshipAmount === preset
                            ? 'bg-[#1559B2] text-white border-[#1559B2]'
                            : 'bg-white text-gray-700 border-[#B9C4D6] hover:bg-gray-50'
                        }`}
                      >
                        ₦{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sponsorship Duration */}
                <div>
                  <span className="block font-space text-sm font-extrabold text-[#1B2433] mb-2">
                    Sponsorship duration
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {DURATION_OPTIONS.map((dur) => {
                      const isSelected = formData.sponsorshipDuration === dur;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => handleInputChange('sponsorshipDuration', dur)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1559B2] bg-[#EEF3FB] text-[#1559B2]'
                              : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-gray-700'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1559B2] bg-[#1559B2]' : 'border-gray-400 bg-white'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span>{dur}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Other duration input */}
                  <AnimatePresence>
                    {formData.sponsorshipDuration === 'Other' && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2">
                          <label
                            htmlFor={otherDurationId}
                            className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1"
                          >
                            Specify your duration
                          </label>
                          <input
                            id={otherDurationId}
                            type="text"
                            className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors"
                            placeholder="e.g. 2 years / Indefinite recurring"
                            value={formData.durationOtherText}
                            onChange={(e) => handleInputChange('durationOtherText', e.target.value)}
                          />
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* SECTION 5: Recognition & Final Details */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    5
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    Recognition & Discovery
                  </h2>
                </div>

                {/* Public Recognition */}
                <div className="mb-5">
                  <span className="block font-space text-sm font-extrabold text-[#1B2433] mb-2">
                    Publicly recognize you as an SS4 Partner?
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-space font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="publicRecognition"
                        checked={formData.publicRecognition === 'yes'}
                        onChange={() => handleInputChange('publicRecognition', 'yes')}
                        className="w-4 h-4 text-[#1559B2]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-space font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="publicRecognition"
                        checked={formData.publicRecognition === 'no'}
                        onChange={() => handleInputChange('publicRecognition', 'no')}
                        className="w-4 h-4 text-[#1559B2]"
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {formData.publicRecognition === 'yes' && (
                    <div className="mt-3">
                      <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Preferred name for recognition
                      </label>
                      <input
                        type="text"
                        className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors"
                        placeholder="e.g. Dr. Jane Chukwu / Chukwu Educational Foundation"
                        value={formData.recognitionName}
                        onChange={(e) => handleInputChange('recognitionName', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* How did you hear about SS4 */}
                <div className="mb-5">
                  <span className="block font-space text-sm font-extrabold text-[#1B2433] mb-2">
                    How did you hear about SS4?
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {REFERRAL_OPTIONS.map((ref) => {
                      const isSelected = formData.referralSource === ref;
                      return (
                        <button
                          key={ref}
                          type="button"
                          onClick={() => handleInputChange('referralSource', ref)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1559B2] bg-[#EEF3FB] text-[#1559B2]'
                              : 'border-[#B9C4D6] bg-[#FAF8F4] hover:bg-white text-gray-700'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1559B2] bg-[#1559B2]' : 'border-gray-400 bg-white'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span>{ref}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Referral other input */}
                  <AnimatePresence>
                    {formData.referralSource === 'Other' && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2">
                          <label
                            htmlFor={otherReferralId}
                            className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1"
                          >
                            Specify how you heard about SS4
                          </label>
                          <input
                            id={otherReferralId}
                            type="text"
                            className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors"
                            placeholder="e.g. WhatsApp group, Newspaper, Coach recommendation"
                            value={formData.referralOtherText}
                            onChange={(e) => handleInputChange('referralOtherText', e.target.value)}
                          />
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Expectations / anything else */}
                <div>
                  <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Anything else SS4 should know, or any expectations for the partnership? <span className="text-gray-500 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] outline-none focus:border-[#1559B2] transition-colors resize-y"
                    placeholder="Share specific milestones, student engagement hopes, or sponsorship inquiries..."
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  />
                </div>
              </section>

              {/* SECTION 6: Confirmation */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    6
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    Confirmation
                  </h2>
                </div>

                {/* Highlighted Confirmation Box with Orange Left Border */}
                <div
                  className="bg-[#EEF3FB] p-4 sm:p-5 rounded-r-xl text-sm leading-relaxed text-[#1B2433] mb-6 font-medium"
                  style={{ borderLeft: '5px solid #C84E00' }}
                >
                  I confirm that my details are accurate and that the amount stated above is my intended monthly contribution to the SS4 Chess League.
                </div>

                {/* Sign-off Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full name (Sign-off)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-[#1B2433] font-medium outline-none focus:border-[#1559B2] transition-colors"
                      placeholder={formData.fullName || "Your legal full name"}
                      value={formData.confirmationName}
                      onChange={(e) => handleInputChange('confirmationName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-space font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#B9C4D6] rounded-none px-0 py-2 text-sm text-gray-700 font-medium outline-none cursor-not-allowed"
                      value={formData.confirmationDate}
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-base px-8 py-3.5 bg-[#1559B2] hover:bg-[#124b96]"
                  >
                    {isSubmitting ? 'Registering Offer...' : 'Submit Partner Registration'}
                  </Button>
                </div>
              </section>

            </form>
          </div>
        )}
      </main>
    </div>
  );
}
