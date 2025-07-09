import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiUser, FiMail, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { token } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'manager'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [token]);

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setFormErrors(data.error ? { general: data.error } : {});
        return;
      }

      setUsers([data.user, ...users]);
      setShowCreateModal(false);
      setFormData({ email: '', password: '', role: 'manager' });
      setFormErrors({});
    } catch (error) {
      setFormErrors({ general: 'Failed to create user' });
      console.error('Error creating user:', error);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        setFormErrors(data.error ? { general: data.error } : {});
        return;
      }

      setUsers(users.map(user => 
        user.id === selectedUser.id ? data.user : user
      ));
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', role: 'manager' });
      setFormErrors({});
    } catch (error) {
      setFormErrors({ general: 'Failed to update user' });
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
        return;
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      alert('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
    setFormErrors({});
  };

  // Reset form
  const resetForm = () => {
    setFormData({ email: '', password: '', role: 'manager' });
    setFormErrors({});
    setShowPassword(false);
  };

  const styles = {
    container: { padding: '2rem' },
    header: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '2rem' 
    },
    title: { 
      fontSize: '2rem', 
      fontWeight: 'bold', 
      color: '#1f2937' 
    },
    createButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.875rem'
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.875rem'
    },
    roleBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    roleAdmin: {
      backgroundColor: '#fef3c7',
      color: '#d97706'
    },
    roleManager: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    actionButton: {
      padding: '0.5rem',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      marginRight: '0.5rem'
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.75rem',
      width: '90%',
      maxWidth: '500px'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem'
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280'
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '1rem'
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem'
    },
    loadingMessage: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '2rem'
    }
  };

  if (loading) {
    return <div style={styles.loadingMessage}>Loading users...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button 
          style={styles.createButton}
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <FiPlus size={16} />
          Create User
        </button>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.tableHeaderCell}>User</th>
            <th style={styles.tableHeaderCell}>Role</th>
            <th style={styles.tableHeaderCell}>Created</th>
            <th style={styles.tableHeaderCell}>Last Login</th>
            <th style={styles.tableHeaderCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={styles.tableCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiUser size={16} color="#6b7280" />
                  <div>
                    <div style={{ fontWeight: '500' }}>{user.email}</div>
                    {currentUser?.id === user.id && (
                      <div style={{ fontSize: '0.75rem', color: '#059669' }}>(You)</div>
                    )}
                  </div>
                </div>
              </td>
              <td style={styles.tableCell}>
                <span style={{
                  ...styles.roleBadge,
                  ...(user.role === 'admin' ? styles.roleAdmin : styles.roleManager)
                }}>
                  <FiShield size={12} style={{ marginRight: '0.25rem' }} />
                  {user.role}
                </span>
              </td>
              <td style={styles.tableCell}>
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td style={styles.tableCell}>
                {user.last_login 
                  ? new Date(user.last_login).toLocaleDateString()
                  : 'Never'
                }
              </td>
              <td style={styles.tableCell}>
                <button
                  style={{ ...styles.actionButton, ...styles.editButton }}
                  onClick={() => openEditModal(user)}
                >
                  <FiEdit size={14} />
                </button>
                {currentUser?.id !== user.id && (
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New User</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    style={styles.input}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formErrors.general && (
                <div style={styles.errorMessage}>{formErrors.general}</div>
              )}
              <button type="submit" style={styles.submitButton}>
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit User</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password (leave blank to keep current)</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    style={styles.input}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formErrors.general && (
                <div style={styles.errorMessage}>{formErrors.general}</div>
              )}
              <button type="submit" style={styles.submitButton}>
                Update User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 