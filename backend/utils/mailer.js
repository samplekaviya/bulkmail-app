const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Sends the same subject/body to a list of recipients.
 * Each recipient is emailed individually so we can report
 * per-recipient success/failure back to the caller.
 *
 * @param {string} subject
 * @param {string} body - HTML content of the email
 * @param {string[]} recipients
 * @returns {Promise<{email: string, status: "sent"|"failed", error: string|null}[]>}
 */
const sendBulkMail = async (subject, body, recipients) => {
  const mailer = getTransporter();
  const fromName = process.env.MAIL_FROM_NAME || "Bulk Mailer";
  const fromAddress = process.env.SMTP_USER;

  const results = [];

  for (const email of recipients) {
    try {
      await mailer.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject,
        html: body,
      });
      results.push({ email, status: "sent", error: null });
      console.log(`[Mailer] Sent to ${email}`);
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
      console.error(`[Mailer] Failed to send to ${email}: ${err.message}`);
    }
  }

  return results;
};

const verifyTransporter = async () => {
  const mailer = getTransporter();
  await mailer.verify();
};

module.exports = { sendBulkMail, verifyTransporter };
