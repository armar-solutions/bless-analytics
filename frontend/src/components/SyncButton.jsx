import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { ArrowClockwise, CheckCircle, XCircle, Clock, ClockHistory } from 'react-bootstrap-icons';

const SyncButton = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sync status on component mount and periodically
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSyncStatus(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sync status:', err);
      setError('Failed to fetch sync status');
    }
  };

  // Trigger a new sync
  const triggerSync = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sync failed');
      }
      
      // Refresh status after sync completes
      setTimeout(() => {
        fetchSyncStatus();
      }, 1000);
      
    } catch (err) {
      console.error('Error triggering sync:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration from seconds to human readable
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format date to local string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'running': return 'warning';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="me-2" />;
      case 'error': return <XCircle className="me-2" />;
      case 'running': return <Spinner animation="border" size="sm" className="me-2" />;
      default: return <Clock className="me-2" />;
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Poll for status updates every 5 seconds if sync is running
    const interval = setInterval(() => {
      if (syncStatus?.currentStatus === 'running') {
        fetchSyncStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [syncStatus?.currentStatus]);

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <ArrowClockwise className="me-2" />
          Data Synchronization
        </h5>
        {syncStatus && (
          <Badge bg={getStatusVariant(syncStatus.currentStatus)}>
            {getStatusIcon(syncStatus.currentStatus)}
            {syncStatus.currentStatus === 'running' ? 'Running' : 
             syncStatus.currentStatus === 'idle' ? 'Idle' : syncStatus.currentStatus}
          </Badge>
        )}
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <strong>Last Sync:</strong> {formatDate(syncStatus?.lastSyncTime)}
            </div>
            
            {syncStatus?.latestSync && (
              <div className="mb-3">
                <strong>Latest Sync Details:</strong>
                <div className="ms-3 mt-2">
                  <div>Status: <Badge bg={getStatusVariant(syncStatus.latestSync.status)}>
                    {syncStatus.latestSync.status}
                  </Badge></div>
                  <div>Started: {formatDate(syncStatus.latestSync.started_at)}</div>
                  <div>Finished: {formatDate(syncStatus.latestSync.finished_at)}</div>
                  {syncStatus.latestSync.finished_at && (
                    <div>Duration: {formatDuration(
                      (new Date(syncStatus.latestSync.finished_at) - new Date(syncStatus.latestSync.started_at)) / 1000
                    )}</div>
                  )}
                  {syncStatus.latestSync.summary && (
                    <div className="mt-2">
                      <strong>Summary:</strong>
                      <div className="ms-3">
                        <div>Contacts: {syncStatus.latestSync.summary.contacts?.count || 0}</div>
                        <div>Course Deals: {syncStatus.latestSync.summary.course_deals?.count || 0}</div>
                        <div>Webinars: {syncStatus.latestSync.summary.webinars?.count || 0}</div>
                        <div>Seminars: {syncStatus.latestSync.summary.seminars?.count || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <strong>Sync Statistics:</strong>
              <div className="ms-3 mt-2">
                <div>Total Syncs: {syncStatus?.stats?.totalSyncs || 0}</div>
                <div>Successful: {syncStatus?.stats?.successfulSyncs || 0}</div>
                <div>Failed: {syncStatus?.stats?.failedSyncs || 0}</div>
                <div>Average Duration: {formatDuration(syncStatus?.stats?.avgDurationSeconds || 0)}</div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <Button
              variant="primary"
              size="lg"
              onClick={triggerSync}
              disabled={isLoading || syncStatus?.currentStatus === 'running'}
              className="w-100 mb-3"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <ArrowClockwise className="me-2" />
                  Sync Data
                </>
              )}
            </Button>
            
            <small className="text-muted">
              This will synchronize all data from NetHunt CRM to your local database.
              The process may take several minutes.
            </small>
          </div>
        </div>
        
        {syncStatus?.syncHistory && syncStatus.syncHistory.length > 0 && (
          <div className="mt-4">
            <h6><ClockHistory className="me-2" />Recent Sync History</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Triggered By</th>
                    <th>Started</th>
                    <th>Finished</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {syncStatus.syncHistory.map((sync) => (
                    <tr key={sync.id}>
                      <td>{sync.id}</td>
                      <td>{sync.triggered_by}</td>
                      <td>{formatDate(sync.started_at)}</td>
                      <td>{formatDate(sync.finished_at)}</td>
                      <td>
                        <Badge bg={getStatusVariant(sync.status)}>
                          {sync.status}
                        </Badge>
                      </td>
                      <td>
                        {sync.finished_at && sync.started_at ? 
                          formatDuration((new Date(sync.finished_at) - new Date(sync.started_at)) / 1000) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SyncButton; 