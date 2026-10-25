const SPREADSHEET_ID = "1hC-qvOnPW14-Pmd5G8nHcBqgnP9ewS8mww69D5iw1KA";
const SHEET_NAME = "Sheet1";
const NOTIFICATION_EMAIL = ""; // Optional: your email

const HEADERS = ["Timestamp", "Name", "Phone", "Email", "Address", "Message"];

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Customer Data Form")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function submitForm(data) {
  if (!data) {
    throw new Error("No form data received.");
  }

  // Validate required fields.
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim();
  const address = String(data.address || "").trim();
  const message = String(data.message || "").trim();

  if (!name || !phone || !email) {
    throw new Error("Name, phone and email are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet tab not found: " + SHEET_NAME);
    }

    // Create the header row if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    // Save the submission in a new row.
    sheet.appendRow([
      new Date(),
      safeCell(name),
      safeCell(phone),
      safeCell(email),
      safeCell(address),
      safeCell(message),
    ]);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  // Optional email notification.
  // Saving to Sheets does not depend on email being enabled.
  let emailNotice = "";

  if (NOTIFICATION_EMAIL.trim()) {
    try {
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL.trim(),
        subject: "New Customer Form Submission",
        body:
          "A new form submission was received.\n\n" +
          "Name: " +
          name +
          "\n" +
          "Phone: " +
          phone +
          "\n" +
          "Email: " +
          email +
          "\n" +
          "Address: " +
          address +
          "\n" +
          "Message: " +
          message,
      });
    } catch (error) {
      emailNotice = " Data was saved, but email notification failed.";
    }
  }

  return "Success! Your data has been saved." + emailNotice;
}

// Prevent user-entered text from being interpreted as a formula.
function safeCell(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
