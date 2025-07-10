import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';
import LearningCenter from './pages/LearningCenter';
import Advertising from './pages/Advertising';
import Funnels from './pages/Funnels';
import Sales from './pages/Sales';
import Students from './pages/Students';
import CallCenter from './pages/CallCenter';
import Sync from './pages/Sync';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <AuthProvider>
    <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute requireManager>
              <Layout>
                <LearningCenter />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/learning" element={
            <ProtectedRoute requireManager>
              <Layout>
                <LearningCenter />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute requireManager>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/advertising" element={
            <ProtectedRoute requireManager>
              <Layout>
                <Advertising />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/funnels" element={
            <ProtectedRoute requireManager>
              <Layout>
                <Funnels />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/sales" element={
            <ProtectedRoute requireManager>
              <Layout>
                <Sales />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/call-center" element={
            <ProtectedRoute requireManager>
              <Layout>
                <CallCenter />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes */}
          <Route path="/sync" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <Sync />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect to login for any unmatched routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
