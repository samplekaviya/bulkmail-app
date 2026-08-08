const express = require("express");
const Email = require("../models/Email");
const { sendBulkMail } = require("../utils/mailer");
const protect = require("../middleware/auth");

const router = express.Router();

const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

// @route   POST /api/mail/send
// @desc    Send a bulk email and log the result to MongoDB
// @access  Private (admin)
router.post("/send", protect, async (req, res) => {
  try {
    let { subject, body, recipients } = req.body;

    // Normalize recipients: accept an array, or a comma/newline separated string
    if (typeof recipients === "string") {
      recipients = recipients
        .split(/[\n,]+/)
        .map((r) => r.trim())
        .filter(Boolean);
    }

    // ---- Validation ----
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required." });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Email body is required." });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "At least one recipient is required." });
    }

    const invalidEmails = recipients.filter((r) => !isValidEmail(r));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: `Invalid recipient email(s): ${invalidEmails.join(", ")}`,
      });
    }

    // ---- Send ----
    const results = await sendBulkMail(subject, body, recipients);
    const successCount = results.filter((r) => r.status === "sent").length;
    const failureCount = results.length - successCount;

    let status = "sent";
    if (successCount === 0) status = "failed";
    else if (failureCount > 0) status = "partial";

    // ---- Persist to MongoDB ----
    const record = await Email.create({
      subject,
      body,
      recipients,
      results,
      status,
      successCount,
      failureCount,
      sentBy: req.admin?.email || "admin",
    });

    const httpStatus = status === "failed" ? 502 : 200;

    return res.status(httpStatus).json({
      message:
        status === "sent"
          ? "All emails sent successfully."
          : status === "partial"
          ? "Some emails failed to send."
          : "All emails failed to send.",
      record,
    });
  } catch (err) {
    console.error(`[POST /api/mail/send] ${err.message}`);
    return res.status(500).json({ message: "Server error while sending mail.", error: err.message });
  }
});

// @route   GET /api/mail/history
// @desc    Fetch previously sent email records, most recent first
// @access  Private (admin)
router.get("/history", protect, async (req, res) => {
  try {
    const records = await Email.find().sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ count: records.length, records });
  } catch (err) {
    console.error(`[GET /api/mail/history] ${err.message}`);
    return res.status(500).json({ message: "Server error while fetching history.", error: err.message });
  }
});

// @route   GET /api/mail/history/:id
// @desc    Fetch a single email record's full detail
// @access  Private (admin)
router.get("/history/:id", protect, async (req, res) => {
  try {
    const record = await Email.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(200).json({ record });
  } catch (err) {
    console.error(`[GET /api/mail/history/:id] ${err.message}`);
    return res.status(500).json({ message: "Server error while fetching record.", error: err.message });
  }
});

module.exports = router;
