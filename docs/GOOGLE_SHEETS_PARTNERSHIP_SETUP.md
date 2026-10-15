# Google Sheets Integration for SS4 Partnership Form

Instead of sending partnership submissions to Supabase, form submissions are directed to the official Google Sheet:
**Spreadsheet Link**: [SS4 Partnership Responses](https://docs.google.com/spreadsheets/d/1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U/edit?usp=sharing)
**Spreadsheet ID**: `1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U`

---

## 1. How It Works

1. When a partner submits the form on `/partners` or `/partner`:
   - The submission payload is formatted into standardized Google Sheet row columns.
   - It is saved locally in `localStorage` (`ss4_partner_offers`) as a resilient client-side backup.
   - If `VITE_PARTNERSHIP_SHEET_WEBHOOK_URL` is configured in `.env`, the form immediately POSTs the payload directly into the Google Sheet via the Google Apps Script Webhook.

---

## 2. 1-Minute Setup Guide for Google Sheet Owner

To receive live rows in the spreadsheet:

1. **Open the Sheet**:
   Visit [https://docs.google.com/spreadsheets/d/1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U/edit?usp=sharing).

2. **Open Script Editor**:
   In the Google Sheets top menu, click **Extensions** > **Apps Script**.

3. **Paste Script**:
   Copy the script code from [`scripts/google-sheets-partner-sync.js`](file:///home/kami/Desktop/codebase/ss4/scripts/google-sheets-partner-sync.js) and paste it into the editor (replace any existing code).

4. **Deploy as Web App**:
   - Click the blue **Deploy** button (top right) > **New deployment**.
   - Click the gear icon next to "Select type" and pick **Web app**.
   - Set **Execute as**: `Me (<your-email>)`.
   - Set **Who has access**: `Anyone`.
   - Click **Deploy**.
   - Authorize access with your Google Account when prompted.

5. **Copy Web App URL**:
   Copy the URL generated (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

6. **Add to `.env`**:
   Add this line to your `.env` file:
   ```env
   VITE_PARTNERSHIP_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
   ```

---

## 3. Spreadsheet Columns Registered

The script automatically sets up the header row on first submission with SS4 brand colors:
1. Reference Code (`SS4-PRT-XXXXXX`)
2. Submission Timestamp
3. Full Name
4. State of Residence
5. Phone Number
6. Email Address
7. Profession
8. Organization
9. Social Profile / LinkedIn
10. Partnership Interests
11. Contributions (Mentorship, Networking, etc.)
12. Other Contribution
13. Monthly Sponsorship (NGN)
14. Public Recognition (Yes / No)
15. Recognition Name
16. Referral Source
17. Other Referral
18. Additional Notes
19. Confirmation Signature
20. Confirmation Date
