import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Users from './pages/Users';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Invoices from './pages/Invoices';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo', direction: 'rtl' } }} />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="patients" element={<Patients />} />
                            <Route path="users" element={<ProtectedRoute allowedRoles={['Admin', 'Receptionist']}><Users /></ProtectedRoute>} />
                            <Route path="appointments" element={<Appointments />} />
                            <Route path="records" element={<Records />} />
                            <Route path="invoices" element={<ProtectedRoute allowedRoles={['Admin', 'Receptionist']}><Invoices /></ProtectedRoute>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
