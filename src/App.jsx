//import { useState } from "react";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollTop';
import HomePage from './pages/HomePage';
import OfferDetailPage from './pages/OfferDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import MyCouponsPage from './pages/MyCouponsPage';////////////////
import  CouponDetailPage  from './pages/MyCouponsPage';
import CheckoutPage from './pages/CheckoutPage';

//Auth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

//Verify
import VerifyPage from './pages/VerifyPage';

//Restablecer contraseña
import PasswordPage from './pages/PasswordPage';

import { useAuth } from './context/AuthContext';
import { authService } from './services/authService';

const Placeholder = ({ title }) => (
  <div className="container-app py-20 text-center">
    <h2 className="font-serif text-xl sm:text-2xl text-navy/40">{title}</h2>
    <p className="text-sm text-navy/30 mt-2"></p>
  </div>
);

function App() {
  const { user } = useAuth ();

  const handleLogout = async() => {
    await authService.logout();
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          {/* Catalog */}
          <Route path="/" element={<HomePage />} />
          <Route path="/offer/:id" element={<OfferDetailPage user={{id:1, name:"Test user"}} />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/my-coupons" element={<MyCouponsPage />} />
          <Route
            path="/coupon/:id"
            element={<CouponDetailPage user={user} />}
          />
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;