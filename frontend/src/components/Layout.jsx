import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { IoMdExit } from 'react-icons/io';
import { FiUsers, FiHeadphones, FiSettings } from 'react-icons/fi';
import { FaChartBar, FaGraduationCap, FaUserGraduate, FaSyncAlt } from 'react-icons/fa';
import { BsFunnel } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/blesslogo.svg';

const navItems = [
  { name: 'Центр навчання', path: '/learning', icon: <FaGraduationCap color="#2563eb" size={22} /> },
  { name: 'Учні', path: '/students', icon: <FaUserGraduate color="#22c55e" size={22} /> },
  { name: 'Менеджери', path: '/advertising', icon: <FiUsers color="#a21caf" size={22} /> },
  { name: 'Воронки', path: '/funnels', icon: <BsFunnel color="#6b7280" size={22} /> },
];

const adminNavItems = [
  { name: 'Синхронізація', path: '/sync', icon: <FaSyncAlt color="#0ea5e9" size={22} /> },
  { name: 'Управління користувачами', path: '/users', icon: <FiSettings color="#f59e0b" size={22} /> },
];

const styles = {
  layout: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: "'Inter', sans-serif" },
  topHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0 0 0 2rem',
    backgroundColor: '#f5f6f8',
    borderBottom: '1px solid #e5e7eb',
    minHeight: 100,
    position: 'relative',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' },
  logoBar: { width: 36, height: 8, background: 'black', borderRadius: 4, marginRight: 16 },
  logo: { height: 100, width: 100, objectFit: 'contain', display: 'block' },
  userSection: { display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: 500, fontSize: 16, color: '#222', letterSpacing: 0.01 },
  logoutIcon: { color: '#2563eb', fontSize: '1.7rem', cursor: 'pointer' },
  secondaryNav: {
    display: 'flex',
    gap: '1.2rem',
    padding: '1rem 1.2rem 1rem 1.2rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.9rem 2.2rem',
    color: '#222',
    textDecoration: 'none',
    borderRadius: '1.5rem',
    backgroundColor: '#fff',
    fontWeight: 600,
    fontSize: 18,
    border: '1.5px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    transition: 'all 0.15s',
  },
  activeNavLink: {
    backgroundColor: '#F5F5F5',
    color: '#222',
    border: '1.5px solid #2563eb',
    boxShadow: '0 4px 12px 0 rgb(37 99 235 / 0.10)',
  },
  mainContent: { flex: '1', padding: '2.5rem 3rem', overflow: 'auto', background: '#f8f9fa' },
};

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={styles.layout}>
      <header style={styles.topHeader}>
        <div style={styles.logoRow}>
          <Link to="/">
            <img src={logo} alt="Logo" style={styles.logo} />
          </Link>
        </div>
        <div style={{...styles.userSection, position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)'}}>
          <span style={{ opacity: 0.8 }}>
            {user?.email} {isAdmin() && '(Admin)'}
          </span>
          <IoMdExit style={styles.logoutIcon} onClick={handleLogout} title="Вийти" />
        </div>
      </header>
      <nav style={styles.secondaryNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) =>
              isActive
                ? { ...styles.navLink, ...styles.activeNavLink, fontWeight: 700 }
                : styles.navLink
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
        {/* Show admin nav items only for admins */}
        {isAdmin() && (
          <>
            <div style={{ borderLeft: '2px solid #e5e7eb', height: 40, margin: '0 1.5rem' }} />
            {adminNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                style={({ isActive }) =>
                  isActive
                    ? { ...styles.navLink, ...styles.activeNavLink, fontWeight: 700 }
                    : styles.navLink
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 