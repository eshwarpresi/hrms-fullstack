import React, { useState, useEffect, useCallback } from 'react';
import { logAPI } from '../services/api';
import './DataManagement.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Use useCallback to memoize the fetchLogs function
  const fetchLogs = useCallback(async () => {
    try {
      const response = await logAPI.getAll({
        page: pagination.page,
        limit: pagination.limit
      });
      setLogs(response.data.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      }));
    } catch (error) {
      alert('Error fetching logs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // Now fetchLogs is a dependency, but it's memoized

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return '#28a745';
    if (action.includes('create')) return '#17a2b8';
    if (action.includes('update')) return '#ffc107';
    if (action.includes('delete')) return '#dc3545';
    if (action.includes('assign') || action.includes('remove')) return '#6610f2';
    return '#6c757d';
  };

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="data-management">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Track all system activities and user actions</p>
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No logs found.</p>
          </div>
        ) : (
          <>
            <div className="logs-list">
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <span 
                      className="log-action"
                      style={{ color: getActionColor(log.action) }}
                    >
                      {log.action}
                    </span>
                    <span className="log-time">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <div className="log-details">
                    <div className="log-user">
                      <strong>User:</strong> {log.User?.name} ({log.User?.email})
                    </div>
                    {log.details && (
                      <div className="log-meta">
                        <strong>Details:</strong> {log.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;