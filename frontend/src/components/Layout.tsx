import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="layout-main">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="content-area">
          <Outlet />
        </main>
        <footer className="app-footer">
          <p>Online Learning System &copy; 2026 – Quản lý hệ thống học trực tuyến</p>
        </footer>
      </div>
    </div>
  );
};
