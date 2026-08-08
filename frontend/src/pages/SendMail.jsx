import { useState } from "react";
import api from "../api/axios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseRecipients = (raw) =>
  raw
    .split(/[\n,]+/)
    .map((r) => r.trim())
    .filter(Boolean);

const SendMail = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { type: "success" | "partial" | "error", message, details }

  const recipients = parseRecipients(recipientsRaw);
  const invalidRecipients = recipients.filter((r) => !EMAIL_REGEX.test(r));

  const validate = () => {
    const nextErrors = {};
    if (!subject.trim()) nextErrors.subject = "Subject is required.";
    if (!body.trim()) nextErrors.body = "Email body is required.";
    if (recipients.length === 0) nextErrors.recipients = "Add at least one recipient email.";
    else if (invalidRecipients.length > 0)
      nextErrors.recipients = `Invalid email(s): ${invalidRecipients.join(", ")}`;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!validate()) return;

    setSending(true);
    try {
      const { data } = await api.post("/mail/send", {
        subject,
        body,
        recipients,
      });

      const status = data.record?.status;
      setResult({
        type: status === "sent" ? "success" : status === "partial" ? "partial" : "error",
        message: data.message,
        details: data.record?.results || [],
      });

      if (status === "sent") {
        setSubject("");
        setBody("");
        setRecipientsRaw("");
      }
    } catch (err) {
      setResult({
        type: "error",
        message: err.response?.data?.message || "Something went wrong while sending mail.",
        details: [],
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Send Bulk Email</h1>
        <p className="subtitle">Compose a message and send it to multiple recipients at once.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Product Launch Announcement"
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </label>

          <label>
            Email Body
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here. Basic HTML is supported."
            />
            {errors.body && <span className="field-error">{errors.body}</span>}
          </label>

          <label>
            Recipient Emails
            <textarea
              rows={4}
              value={recipientsRaw}
              onChange={(e) => setRecipientsRaw(e.target.value)}
              placeholder="Separate multiple emails with commas or new lines&#10;e.g. alice@example.com, bob@example.com"
            />
            <span className="field-hint">{recipients.length} recipient(s) detected</span>
            {errors.recipients && <span className="field-error">{errors.recipients}</span>}
          </label>

          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? "Sending..." : `Send to ${recipients.length || ""} Recipient(s)`}
          </button>
        </form>

        {result && (
          <div
            className={`alert ${
              result.type === "success"
                ? "alert-success"
                : result.type === "partial"
                ? "alert-warning"
                : "alert-error"
            }`}
          >
            <strong>{result.message}</strong>
            {result.details?.length > 0 && (
              <ul className="result-list">
                {result.details.map((r) => (
                  <li key={r.email}>
                    <span className={`badge badge-${r.status}`}>{r.status}</span> {r.email}
                    {r.error ? ` — ${r.error}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMail;
