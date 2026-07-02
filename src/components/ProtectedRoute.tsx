import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentVendorId = useAppStore((s) => s.currentVendorId);
  if (!isAuthenticated || !currentVendorId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
