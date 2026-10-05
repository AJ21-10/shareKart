import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { ChatModal } from "./components/ChatModal";
import { AddProductModal } from "./components/AddProductModal";
import { Toast } from "./components/Toast";

// Existing Pages
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";

// Phase 2 Pages
import { ListItemPage } from "./pages/ListItemPage";
import { ChatPage } from "./pages/ChatPage";
import { HandoverPassPage } from "./pages/HandoverPassPage";

// Phase 3 Pages & Modals
import { AadhaarKycPage } from "./pages/AadhaarKycPage";
import { DisputeMediationPage } from "./pages/DisputeMediationPage";
import { PublicTrustProfilePage } from "./pages/PublicTrustProfilePage";
import { ReturnHandoverPage } from "./pages/ReturnHandoverPage";
import { QuickRentModal } from "./components/QuickRentModal";

const resolveRoute = () => {
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const hash = window.location.hash.replace(/^#\/?/, "");
  const path = pathname || hash;

  if (path === "list-item" || path === "post-listing") {
    return { page: "list-item", params: {} };
  }
  if (path === "chat" || path === "chat-inbox") {
    return { page: "chat", params: {} };
  }
  if (
    path === "handover-pass" ||
    path === "rental-pass" ||
    path === "confirmation-pass"
  ) {
    return { page: "handover-pass", params: {} };
  }
  if (path === "orders" || path === "my-orders-rentals") {
    return { page: "orders", params: {} };
  }
  if (path === "dashboard") {
    return { page: "dashboard", params: {} };
  }
  if (path === "inventory") {
    return { page: "dashboard", params: { tab: "inventory" } };
  }
  if (path === "contracts") {
    return { page: "dashboard", params: { tab: "contracts" } };
  }
  if (path === "payouts") {
    return { page: "dashboard", params: { tab: "payouts" } };
  }
  if (
    path === "aadhaar-ekyc" ||
    path === "kyc" ||
    path === "uidai-verification"
  ) {
    return { page: "aadhaar-ekyc", params: {} };
  }
  if (path === "disputes" || path === "mediation" || path === "arbitration") {
    return { page: "disputes", params: {} };
  }
  if (
    path === "profile" ||
    path === "trust-profile" ||
    path === "seller-profile"
  ) {
    return { page: "profile", params: {} };
  }
  if (
    path === "return-pass" ||
    path === "return-handover" ||
    path === "return-check"
  ) {
    return { page: "return-pass", params: {} };
  }
  if (path === "checkout") {
    return { page: "checkout", params: {} };
  }
  if (path === "search") {
    return { page: "search", params: {} };
  }
  if (path === "product") {
    return { page: "product", params: {} };
  }
  return { page: "home", params: {} };
};

export function AppContent() {
  const initial = resolveRoute();
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [pageParams, setPageParams] = useState(initial.params);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [quickRentProduct, setQuickRentProduct] = useState(null);

  useEffect(() => {
    const handlePopState = (e) => {
      const route = resolveRoute();
      setCurrentPage(route.page);
      setPageParams(e.state || route.params);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const navigateTo = (page, params = {}) => {
    let targetPage = page;
    let targetParams = { ...params };

    if (
      page === "sharekart_list_an_item_for_rent_or_sale" ||
      page === "post-listing"
    ) {
      targetPage = "list-item";
    } else if (
      page === "sharekart_p2p_chat_neighborhood_coordination" ||
      page === "chat-inbox"
    ) {
      targetPage = "chat";
    } else if (
      page === "sharekart_rental_handover_confirmation_pass" ||
      page === "rental-pass" ||
      page === "confirmation-pass"
    ) {
      targetPage = "handover-pass";
    } else if (page === "kyc" || page === "uidai-verification") {
      targetPage = "aadhaar-ekyc";
    } else if (page === "mediation" || page === "arbitration") {
      targetPage = "disputes";
    } else if (page === "trust-profile" || page === "seller-profile") {
      targetPage = "profile";
    } else if (page === "return-handover" || page === "return-check") {
      targetPage = "return-pass";
    } else if (
      page === "inventory" ||
      page === "contracts" ||
      page === "payouts"
    ) {
      targetPage = "dashboard";
      targetParams = { ...targetParams, tab: page };
    }

    setCurrentPage(targetPage);
    setPageParams(targetParams);

    const targetPath = targetPage === "home" ? "/" : `/${targetPage}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(targetParams, "", targetPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Fixed Navbar */}
      <Navbar
        activePage={currentPage}
        onNavigate={navigateTo}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenChat={() => navigateTo("chat")}
        onOpenAddProduct={() => navigateTo("list-item")}
        onToast={showToast}
      />

      {/* Main Routed Page Container */}
      <main className="w-full pt-24 sm:pt-28 md:pt-32 max-w-[1280px] mx-auto px-3 sm:px-4 md:px-gutter-desktop pb-20 md:pb-8 flex-1">
        {currentPage === "home" && (
          <HomePage
            onNavigate={navigateTo}
            onOpenAddProduct={() => navigateTo("list-item")}
            onQuickRent={(prod) => setQuickRentProduct(prod)}
            onToast={showToast}
          />
        )}

        {currentPage === "search" && (
          <SearchPage
            initialFilters={pageParams}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {currentPage === "product" && (
          <ProductDetailsPage
            productId={pageParams.id || 1}
            onNavigate={navigateTo}
            onOpenChat={() => navigateTo("chat")}
            onToast={showToast}
          />
        )}

        {currentPage === "checkout" && (
          <CheckoutPage
            params={pageParams}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {currentPage === "dashboard" && (
          <DashboardPage
            params={pageParams}
            onNavigate={navigateTo}
            onOpenAddProduct={() => navigateTo("list-item")}
            onToast={showToast}
          />
        )}

        {currentPage === "orders" && <OrdersPage onNavigate={navigateTo} />}

        {/* Phase 2 Pages */}
        {currentPage === "list-item" && (
          <ListItemPage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "chat" && (
          <ChatPage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "handover-pass" && (
          <HandoverPassPage
            params={pageParams}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Phase 3 Pages */}
        {currentPage === "aadhaar-ekyc" && (
          <AadhaarKycPage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "disputes" && (
          <DisputeMediationPage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "profile" && (
          <PublicTrustProfilePage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "return-pass" && (
          <ReturnHandoverPage
            params={pageParams}
            onNavigate={navigateTo}
            onToast={showToast}
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
          if (currentPage === "dashboard") {
            navigateTo("dashboard");
          } else if (currentPage === "search") {
            navigateTo("search");
          } else {
            navigateTo("home");
          }
        }}
        onToast={showToast}
      />

      {/* Phase 3 Bottom Sheet / Drawer Modal */}
      <QuickRentModal
        isOpen={!!quickRentProduct}
        product={quickRentProduct}
        onClose={() => setQuickRentProduct(null)}
        onNavigate={navigateTo}
        onToast={showToast}
      />

      {/* Global Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
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
