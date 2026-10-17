/**
 * Partner Sheet Service
 *
 * Replaces Supabase storage for the SS4 Partnership Form by writing directly
 * to Google Sheets.
 *
 */

// Google Apps Script Webhook URL (configured via environment variable)
const WEBHOOK_URL = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_PARTNERSHIP_SHEET_WEBHOOK_URL || import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '')
  : (typeof process !== 'undefined' && process.env ? (process.env.VITE_PARTNERSHIP_SHEET_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '') : '');

/**
 * Format the partner payload into standardized Google Sheet row values
 */
export function formatPartnerDataForSheet(payload) {
  return {
    sheet_name: payload.sheet_name || 'Sheet2',
    reference_code: payload.reference_code,
    created_at: payload.created_at || new Date().toISOString(),
    full_name: payload.full_name,
    state_of_residence: payload.state_of_residence,
    phone: payload.phone,
    email: payload.email,
    profession: payload.profession || '',
    organization: payload.organization || '',
    social_profile: payload.social_profile || '',
    partnership_interests: payload.partnership_interests || '',
    contributions: Array.isArray(payload.contributions)
      ? payload.contributions.join(', ')
      : (payload.contributions || ''),
    contribution_other: payload.contribution_other || '',
    sponsorship_amount_monthly: payload.sponsorship_amount_monthly || 'Voluntary / General Support',
    public_recognition: payload.public_recognition ? 'Yes' : 'No',
    recognition_name: payload.recognition_name || '',
    referral_source: payload.referral_source || '',
    referral_source_other: payload.referral_source_other || '',
    additional_notes: payload.additional_notes || '',
    confirmation_name: payload.confirmation_name || '',
    confirmation_date: payload.confirmation_date || '',
  };
}

/**
 * Submit partner registration to Google Sheets
 *
 * 1. Persists locally in localStorage as a reliable backup
 * 2. If a Google Apps Script Webhook URL is configured, POSTs the submission
 *    using mode: 'no-cors' to avoid preflight/CORS redirect issues.
 */
export async function submitPartnerOfferToGoogleSheets(payload) {
  const formattedData = formatPartnerDataForSheet(payload);

  // 1. Client-side local backup
  try {
    const existing = JSON.parse(localStorage.getItem('ss4_partner_offers') || '[]');
    existing.unshift({
      ...payload,
      _syncedAt: new Date().toISOString()
    });
    localStorage.setItem('ss4_partner_offers', JSON.stringify(existing));
  } catch (err) {
    console.warn('[PartnerSheetService] Local storage backup failed:', err);
  }

  // 2. Submit to Google Sheets Webhook
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formattedData),
      });
      return { success: true, via: 'webhook' };
    } catch (err) {
      console.warn('[PartnerSheetService] Webhook POST failed:', err);
      return { success: false, error: err };
    }
  } else {
    console.info(
      '[PartnerSheetService] Submission saved locally. To enable direct live streaming to Google Sheets, configure VITE_PARTNERSHIP_SHEET_WEBHOOK_URL in .env.'
    );
    return { success: true, via: 'local_storage_backup' };
  }
}
