import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Share from './pages/Share';
import Reservations from './pages/Reservations';
import Listings from './pages/Listings';
import './styles.css';
function RootRoutes(){const {loading}=useAuth();if(loading)return <div className="loading-screen">Setting the table…</div>;return <Routes><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/signup" element={<AuthPage mode="signup"/>}/><Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="discover" element={<Discover/>}/><Route path="share" element={<Share/>}/><Route path="reservations" element={<Reservations/>}/><Route path="listings" element={<Listings/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><RootRoutes/></AuthProvider></BrowserRouter></React.StrictMode>);
