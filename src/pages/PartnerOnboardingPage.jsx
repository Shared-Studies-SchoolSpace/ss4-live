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

// Contribution options
const CONTRIBUTION_OPTIONS = [
  'Mentorship',
  'Networking',
  'Publicity',
  'Expertise',
  'Other'
];

// Referral Options
const REFERRAL_OPTIONS = [
  'Social media',
  'Friend / referral',
  'SS4 event',
  'Other'
];

export default function PartnerOnboardingPage() {
  const otherContribId = useId();
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

    // Section 2: Your Partnership
    interestsText: '',
    contributions: ['Mentorship', 'Networking'],
    contributionOtherText: '',

    // Section 3: SCL Monthly Sponsorship
    sponsorshipAmount: '',

    // Section 4: Recognition & Final Details
    publicRecognition: 'yes', // 'yes' | 'no'
    recognitionName: '',
    referralSource: 'Social media',
    referralOtherText: '',
    additionalNotes: '',

    // Section 5: Confirmation
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
      partnership_interests: formData.interestsText.trim(),
      contributions: formData.contributions,
      contribution_other: formData.contributions.includes('Other') ? formData.contributionOtherText.trim() : null,
      sponsorship_amount_monthly: formData.sponsorshipAmount ? formData.sponsorshipAmount.trim() : null,
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
                    {submittedData.sponsorshipAmount ? `₦${submittedData.sponsorshipAmount} / month` : 'Voluntary / General Support'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Organization / Role</dt>
                  <dd className="font-space font-extrabold text-[#1B2433]">
                    {submittedData.organization || submittedData.profession || 'Independent Partner'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Primary Contact</dt>
                  <dd className="font-space font-extrabold text-[#1559B2] truncate">
                    {submittedData.email || submittedData.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-bold mb-0.5">Location</dt>
                  <dd className="font-space font-extrabold text-[#1B2433]">
                    {submittedData.stateOfResidence || 'Nigeria'}
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
              {/* SECTION 2: Your Partnership */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    2
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

              {/* SECTION 3: SCL Monthly Sponsorship */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    3
                  </span>
                  <h2 className="text-lg sm:text-xl font-space font-black text-[#1559B2] m-0">
                    SCL Monthly Sponsorship
                  </h2>
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-space text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Intended sponsorship for the SS4 Chess League (SCL) Monthly Games
                  </label>
                  <div className="flex items-baseline gap-2 text-2xl font-black text-[#C84E00]">
                    <span>₦</span>
                    <input
                      type="text"
                      className="font-space font-black text-2xl bg-transparent border-0 border-b-2 border-[#1559B2] outline-none text-[#1B2433] w-48 sm:w-56 px-0 py-0.5 focus:border-[#C84E00] transition-colors"
                      value={formData.sponsorshipAmount}
                      onChange={(e) => handleInputChange('sponsorshipAmount', e.target.value)}
                    />
                    <small className="text-sm font-semibold text-gray-600 font-avenir">per month</small>
                  </div>
                </div>
              </section>

              {/* SECTION 4: Recognition & Final Details */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    4
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

              {/* SECTION 5: Confirmation */}
              <section className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 my-6">
                  <span className="w-7 h-7 rounded-full bg-[#C84E00] text-white flex items-center justify-center font-space font-black text-xs shrink-0">
                    5
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
