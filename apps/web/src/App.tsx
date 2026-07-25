import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { WorkOrders } from './pages/WorkOrders';
import { Invoices } from './pages/Invoices';
import { InvoiceNew } from './pages/InvoiceNew';
import { ComplianceDocs } from './pages/ComplianceDocs';
import { Profile } from './pages/Profile';
import { AccessRequests } from './pages/AccessRequests';
import { ProtectedRoute } from './components/ProtectedRoute';

function LoginRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }
  if (isSignedIn) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders"
          element={
            <ProtectedRoute>
              <WorkOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <ProtectedRoute>
              <InvoiceNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <ComplianceDocs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/access-requests"
          element={
            <ProtectedRoute>
              <AccessRequests />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
