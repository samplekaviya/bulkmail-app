import { Fragment, useEffect, useState } from "react";
import api from "../api/axios";

const statusBadgeClass = {
  sent: "badge-sent",
  failed: "badge-failed",
  partial: "badge-partial",
};

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/mail/history");
      setRecords(data.records || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load email history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="page">
      <div className="card">
        <div className="history-header">
          <div>
            <h1>Email History</h1>
            <p className="subtitle">Previously sent bulk email campaigns.</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchHistory} disabled={loading}>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <p>Loading history...</p>}

        {!loading && records.length === 0 && !error && (
          <p className="empty-state">No emails have been sent yet.</p>
        )}

        {!loading && records.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Recipients</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <Fragment key={r._id}>
                  <tr>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.subject}</td>
                    <td>{r.recipients.length}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass[r.status] || ""}`}>{r.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                      >
                        {expandedId === r._id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r._id && (
                    <tr className="history-details-row">
                      <td colSpan={5}>
                        <div className="history-details">
                          <p>
                            <strong>Success:</strong> {r.successCount} &nbsp;|&nbsp;
                            <strong>Failed:</strong> {r.failureCount}
                          </p>
                          <p>
                            <strong>Body:</strong>
                          </p>
                          <div
                            className="body-preview"
                            dangerouslySetInnerHTML={{ __html: r.body }}
                          />
                          <p>
                            <strong>Recipients:</strong>
                          </p>
                          <ul className="result-list">
                            {r.results.map((res) => (
                              <li key={res.email}>
                                <span className={`badge badge-${res.status}`}>{res.status}</span>{" "}
                                {res.email}
                                {res.error ? ` — ${res.error}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
