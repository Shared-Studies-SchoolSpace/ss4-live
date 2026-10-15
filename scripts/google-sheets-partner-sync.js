/**
 * ============================================================================
 * SS4 CHESS LEAGUE - PARTNERSHIP GOOGLE SHEETS WEBHOOK (APPS SCRIPT)
 * ============================================================================
 * 
 * Target Google Sheet:
 * https://docs.google.com/spreadsheets/d/1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U/edit?usp=sharing
 * 
 * SETUP INSTRUCTIONS (Takes ~1 minute):
 * 1. Open the Google Sheet above in your browser.
 * 2. In the top menu, go to: Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, and paste this entire script.
 * 4. Click the "Save" icon (or press Ctrl+S / Cmd+S).
 * 5. Click the blue "Deploy" button at the top right > "New deployment".
 * 6. Under "Select type", choose "Web app".
 * 7. Set:
 *    - Description: "SS4 Partnership Submissions Webhook"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy", review permissions and approve access.
 * 9. Copy the generated "Web App URL" (ends in /exec).
 * 10. Paste this URL into your project's .env file:
 *     VITE_PARTNERSHIP_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 * ============================================================================
 */

var SPREADSHEET_ID = "1WYHMJItVidg78B-4FBMJJuG06VzqVNzBMo82b1ijZ4U";
var SHEET_NAME = "Partnership Submissions";

function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // If "Partnership Submissions" does not exist, use active or rename Sheet1
    sheet = ss.getActiveSheet();
    if (sheet.getLastRow() === 0 && sheet.getLastColumn() === 0) {
      sheet.setName(SHEET_NAME);
    }
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Reference Code",
      "Timestamp",
      "Full Name",
      "State of Residence",
      "Phone Number",
      "Email Address",
      "Profession",
      "Organization",
      "Social Profile",
      "Partnership Interests",
      "Contributions",
      "Other Contribution",
      "Monthly Sponsorship (NGN)",
      "Public Recognition",
      "Recognition Name",
      "Referral Source",
      "Other Referral",
      "Additional Notes",
      "Confirmation Signature",
      "Confirmation Date"
    ];
    
    sheet.appendRow(headers);
    
    // Style Header Row (SS4 Royal Blue & Crisp White Text)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1559B2");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontSize(10);
    headerRange.setVerticalAlignment("middle");
    
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);
    
    // Auto resize column widths for optimal reading
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 15 seconds for concurrent submissions to prevent collision
  var success = lock.tryLock(15000);
  
  if (!success) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Server busy, could not acquire lock" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var row = [
      data.reference_code || ("SS4-PRT-" + Math.floor(100000 + Math.random() * 900000)),
      data.created_at || new Date().toISOString(),
      data.full_name || "",
      data.state_of_residence || "",
      data.phone || "",
      data.email || "",
      data.profession || "",
      data.organization || "",
      data.social_profile || "",
      data.partnership_interests || "",
      Array.isArray(data.contributions) ? data.contributions.join(", ") : (data.contributions || ""),
      data.contribution_other || "",
      data.sponsorship_amount_monthly || "Voluntary",
      data.public_recognition ? "Yes" : "No",
      data.recognition_name || "",
      data.referral_source || "",
      data.referral_source_other || "",
      data.additional_notes || "",
      data.confirmation_name || "",
      data.confirmation_date || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", reference_code: row[0] }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      message: "SS4 Chess League Partnership Webhook is operational.",
      spreadsheet: "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
