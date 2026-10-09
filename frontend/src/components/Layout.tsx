import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="layout-full">
      <Header />
      <main className="content-area">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Online Learning System &copy; 2026 – Nền tảng quản lý và đào tạo trực tuyến</p>
      </footer>
    </div>
  );
};
