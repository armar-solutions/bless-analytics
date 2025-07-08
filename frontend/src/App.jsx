import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import LearningCenter from './pages/LearningCenter';
import Advertising from './pages/Advertising';
import Funnels from './pages/Funnels';
import Sales from './pages/Sales';
import Students from './pages/Students';
import CallCenter from './pages/CallCenter';
import Sync from './pages/Sync';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LearningCenter />} />
          <Route path="/learning" element={<LearningCenter />} />
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/funnels" element={<Funnels />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/students" element={<Students />} />
          <Route path="/call-center" element={<CallCenter />} />
          <Route path="/sync" element={<Sync />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
