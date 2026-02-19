import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      {/* ✅ Safe area & fixed navbar offset */}
      <main className="pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[4.5rem+env(safe-area-inset-top)] flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}