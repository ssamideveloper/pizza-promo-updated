
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { PageLayout } from './components/Layout';

// Pages
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Tracking from './pages/customer/Tracking';
import Rewards from './pages/customer/Rewards';
import Deals from './pages/customer/Deals';
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          {/* Admin Route (No Layout) */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Customer Routes (With Layout) */}
          <Route path="/" element={<PageLayout><Home /></PageLayout>} />
          <Route path="/menu" element={<PageLayout><Menu /></PageLayout>} />
          <Route path="/cart" element={<PageLayout><Cart /></PageLayout>} />
          <Route path="/track" element={<PageLayout><Tracking /></PageLayout>} />
          <Route path="/rewards" element={<PageLayout><Rewards /></PageLayout>} />
          <Route path="/deals" element={<PageLayout><Deals /></PageLayout>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
