import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../supabase';
import { toast } from 'react-toastify';

export default function WhatsAppPromptNotification() {
  const { user, profile, setProfile, refreshProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState('');

  // Check if session dismiss flag was set
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('ss4_whatsapp_prompt_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  // Only show if user is logged in, profile exists, phone number is missing, and prompt not dismissed
  const hasPhone = Boolean(profile?.phone || profile?.whatsapp || profile?.whatsapp_number);
  if (!user || !profile || hasPhone || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ss4_whatsapp_prompt_dismissed', 'true');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const raw = phoneNumber.trim();
    if (!raw) {
      setError('Please enter your WhatsApp phone number.');
      return;
    }

    const digits = raw.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // Clean phone format (e.g. 080... to 23480...)
      let cleanPhone = digits;
      if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        cleanPhone = '234' + cleanPhone.slice(1);
      } else if (cleanPhone.length === 10 && (cleanPhone.startsWith('80') || cleanPhone.startsWith('81') || cleanPhone.startsWith('90') || cleanPhone.startsWith('70') || cleanPhone.startsWith('91'))) {
        cleanPhone = '234' + cleanPhone;
      }

      console.log('[WhatsApp Notification] Saving phone number to profile:', cleanPhone);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone, whatsapp: cleanPhone })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      // Optimistically update local profile context
      setProfile(prev => ({
        ...prev,
        phone: cleanPhone,
        whatsapp: cleanPhone
      }));

      await refreshProfile();
      toast.success('WhatsApp number updated successfully! Direct invites enabled.');
    } catch (err) {
      console.error('[WhatsApp Notification] Save failed:', err);
      toast.error('Failed to update phone number: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-[420px] z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-5 relative overflow-hidden flex flex-col gap-3">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#25D366] via-emerald-500 to-teal-500" />

        {/* Header & Von Restorff Distinct Badge */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block">
                Account Setup • Action Required
              </span>
              <h4 className="text-sm font-bold font-space text-[#111111] leading-tight">
                Add your WhatsApp Number
              </h4>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Remind me later"
            aria-label="Dismiss prompt"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zeigarnik Effect Progress Indicator */}
        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/80">
          <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
            <span>Profile Completion</span>
            <span>80% Done</span>
          </div>
          <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div className="bg-[#25D366] h-full rounded-full w-[80%] transition-all duration-500" />
          </div>
          <p className="text-xs text-gray-600 font-medium mt-2 leading-relaxed">
            Players can reach out on WhatsApp to schedule live matches & tournament challenges!
          </p>
        </div>

        {/* Input Form with Fitts's Law 44px Touch Targets */}
        <form onSubmit={handleSave} className="flex flex-col gap-2.5 mt-1">
          <div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-gray-400 select-none">
                🇳🇬 +234
              </span>
              <input
                type="tel"
                placeholder="0801 234 5678"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError('');
                }}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#25D366] focus:bg-white rounded-xl pl-16 pr-3 py-2.5 text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-all min-h-[44px]"
              />
            </div>
            {error && <p className="text-[10px] font-bold text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save WhatsApp Number</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 px-3 rounded-xl transition-all text-center cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
