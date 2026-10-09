import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Listings from "./pages/Listings";
import MapPage from "./pages/Map";
import Profile from "./pages/Profile";
// import Merchant from "./pages/Merchant";
import BusinessDetails from "./pages/BusinessDetails";
import VerifyEmail from "./pages/VerifyEmail.jsx";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import NotFound from "./pages/NotFound";

import Admin from "./pages/admin/Admin";
import Overview from "./pages/admin/Overview";
import Merchants from "./pages/admin/Merchants";
import Verification from "./pages/admin/Verification";
import Offers from "./pages/admin/Offers";
import Reviews from "./pages/admin/Reviews";
import Analytics from "./pages/admin/Analytics";
import Approval from "./pages/admin/Approval";
import OwnerManagement from "./pages/admin/OwnerManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminProfile from "./pages/admin/Profile";

import MerchantLayout from "./pages/merchant/MerchantLayout";
import MerchantDashboard from "./pages/merchant/Dashboard";
import MerchantListings from "./pages/merchant/Listings";
import MerchantOffers from "./pages/merchant/Offers";
import MerchantInsights from "./pages/merchant/Insights";
import MerchantAccount from "./pages/merchant/Account";

import OwnerRoute from "./components/auth/OwnerRoute";
import AdminRoute from "./components/auth/AdminRoute";

import "./App.css";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  /* ==========================================================
                        SPLASH SCREEN
  ========================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* ======================================================
                            PUBLIC PAGES
      ====================================================== */}

      <Route path="/" element={<Home />} />

      <Route path="/categories" element={<Categories />} />

      <Route path="/listings" element={<Listings />} />

      <Route path="/businesses/:businessId" element={<BusinessDetails />} />

      <Route path="/map" element={<MapPage />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="/merchant" element={<MerchantLayout />}>
        <Route index element={<MerchantDashboard />} />

        <Route path="listings" element={<MerchantListings />} />

        <Route path="offers" element={<MerchantOffers />} />

        <Route path="insights" element={<MerchantInsights />} />

        <Route path="account" element={<MerchantAccount />} />
      </Route>

      {/* ======================================================
                        AUTHENTICATION
      ====================================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ======================================================
                        ADMIN
====================================================== */}

      <Route path="/admin" element={<Admin />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Overview />} />

        <Route path="merchants" element={<Merchants />} />

        <Route path="verification" element={<Verification />} />

        <Route path="approval" element={<Approval />} />

        <Route path="offers" element={<Offers />} />

        <Route path="reviews" element={<Reviews />} />

        <Route path="analytics" element={<Analytics />} />

        <Route
          path="owners"
          element={
            <OwnerRoute>
              <OwnerManagement />
            </OwnerRoute>
          }
        />

        <Route
          path="users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        <Route
          path="profile"
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />
      </Route>

      {/* ======================================================
                            404
      ====================================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
