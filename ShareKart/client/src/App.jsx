import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { ChatModal } from './components/ChatModal';
import { AddProductModal } from './components/AddProductModal';
import { Toast } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Fixed Navbar */}
      <Navbar
        activePage={currentPage}
        onNavigate={navigateTo}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenChat={() => setChatModalOpen(true)}
        onOpenAddProduct={() => setAddProductModalOpen(true)}
        onToast={showToast}
      />

      {/* Main Routed Page Container (accounting for fixed h-28 header) */}
      <main className="w-full pt-32 max-w-[1280px] mx-auto px-gutter-desktop flex-1">
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={navigateTo} 
            onOpenAddProduct={() => setAddProductModalOpen(true)} 
            onToast={showToast} 
          />
        )}

        {currentPage === 'search' && (
          <SearchPage 
            initialFilters={pageParams} 
            onNavigate={navigateTo} 
            onToast={showToast} 
          />
        )}

        {currentPage === 'product' && (
          <ProductDetailsPage 
            productId={pageParams.id || 1} 
            onNavigate={navigateTo} 
            onOpenChat={() => setChatModalOpen(true)} 
            onToast={showToast} 
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage 
            params={pageParams} 
            onNavigate={navigateTo} 
            onToast={showToast} 
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage 
            onNavigate={navigateTo} 
            onOpenAddProduct={() => setAddProductModalOpen(true)} 
            onToast={showToast} 
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage 
            onNavigate={navigateTo} 
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onToast={showToast}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onNavigate={navigateTo}
      />

      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />

      <AddProductModal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        onProductCreated={() => {
          // If on home or search or dashboard, trigger refresh
          if (currentPage === 'dashboard') {
            navigateTo('dashboard');
          } else if (currentPage === 'search') {
            navigateTo('search');
          } else {
            navigateTo('home');
          }
        }}
        onToast={showToast}
      />

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
