import React, { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { ChatModal } from "./components/ChatModal";
import { AddProductModal } from "./components/AddProductModal";
import { AadhaarPromptModal } from "./components/AadhaarPromptModal";
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
import { ProfilePage } from "./pages/ProfilePage";
import { PublicTrustProfilePage } from "./pages/PublicTrustProfilePage";
import { ReturnHandoverPage } from "./pages/ReturnHandoverPage";
import { QuickRentModal } from "./components/QuickRentModal";

// Dedicated Full-Page Auth
import { AuthPage } from "./pages/AuthPage";

const resolveRoute = () => {
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const hash = window.location.hash.replace(/^#\/?/, "");
  const path = pathname || hash;

  if (path === "login" || path === "signin" || path === "auth") {
    return { page: "login", params: {} };
  }
  if (path === "register" || path === "signup") {
    return { page: "register", params: {} };
  }
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
  if (path === "profile" || path === "my-profile") {
    return { page: "profile", params: {} };
  }
  if (
    path === "trust-profile" ||
    path === "seller-profile" ||
    path === "public-profile"
  ) {
    return { page: "trust-profile", params: {} };
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
  if (
    path === "search" ||
    path === "products" ||
    path === "all-products" ||
    path === "categories"
  ) {
    return { page: "search", params: {} };
  }
  if (path === "product") {
    return { page: "product", params: {} };
  }
  return { page: "home", params: {} };
};

export function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const initial = resolveRoute();
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [pageParams, setPageParams] = useState(initial.params);
  const [toastMessage, setToastMessage] = useState("");
  const prevAuthRef = useRef(isAuthenticated);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [quickRentProduct, setQuickRentProduct] = useState(null);

  // Aadhaar Prompt Modal State
  const [aadhaarModalOpen, setAadhaarModalOpen] = useState(false);
  const [aadhaarModalReason, setAadhaarModalReason] = useState("general");
  const [pendingActionAfterAadhaar, setPendingActionAfterAadhaar] = useState(null);

  const triggerAadhaarModal = (reason = "general", callback = null) => {
    setAadhaarModalReason(reason);
    setPendingActionAfterAadhaar(() => callback);
    setAadhaarModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    if (!user) {
      navigateTo("login");
      return;
    }
    if (!user.is_aadhaar_verified) {
      triggerAadhaarModal("list", () => navigateTo("list-item"));
      return;
    }
    navigateTo("list-item");
  };

  const handleQuickRent = (prod) => {
    if (!user) {
      navigateTo("login");
      return;
    }
    if (!user.is_aadhaar_verified) {
      triggerAadhaarModal("buy", () => setQuickRentProduct(prod));
      return;
    }
    setQuickRentProduct(prod);
  };

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
    } else if (page === "signin" || page === "auth") {
      targetPage = "login";
    } else if (page === "signup") {
      targetPage = "register";
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
    } else if (page === "profile" || page === "my-profile") {
      targetPage = "profile";
    } else if (
      page === "trust-profile" ||
      page === "seller-profile" ||
      page === "public-profile"
    ) {
      targetPage = "trust-profile";
    } else if (page === "return-handover" || page === "return-check") {
      targetPage = "return-pass";
    } else if (
      page === "inventory" ||
      page === "contracts" ||
      page === "payouts"
    ) {
      targetPage = "dashboard";
      targetParams = { ...targetParams, tab: page };
    } else if (
      page === "products" ||
      page === "all-products" ||
      page === "categories"
    ) {
      targetPage = "search";
      targetParams = { category: "all", ...targetParams };
    }

    // Intercept listing attempt if user is unverified
    if (targetPage === "list-item") {
      if (!user) {
        targetPage = "login";
      } else if (!user.is_aadhaar_verified) {
        triggerAadhaarModal("list", () => {
          setCurrentPage("list-item");
          setPageParams(targetParams);
          const p = "/list-item";
          if (window.location.pathname !== p) window.history.pushState(targetParams, "", p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        return;
      }
    }

    // Intercept checkout attempt if user is unverified
    if (targetPage === "checkout") {
      if (!user) {
        targetPage = "login";
      } else if (!user.is_aadhaar_verified) {
        triggerAadhaarModal("buy", () => {
          setCurrentPage("checkout");
          setPageParams(targetParams);
          const p = "/checkout";
          if (window.location.pathname !== p) window.history.pushState(targetParams, "", p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        return;
      }
    }

    setCurrentPage(targetPage);
    setPageParams(targetParams);

    const targetPath = targetPage === "home" ? "/" : `/${targetPage}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(targetParams, "", targetPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-redirect to home page when logout occurs from any endpoint
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      navigateTo("home");
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Protected pages auto-redirection to home if user is not authenticated
  useEffect(() => {
    const protectedPages = [
      "profile",
      "dashboard",
      "orders",
      "list-item",
      "chat",
      "disputes",
      "handover-pass",
      "return-pass",
      "aadhaar-ekyc",
    ];
    if (!loading && !isAuthenticated && protectedPages.includes(currentPage)) {
      navigateTo("home");
    }
  }, [isAuthenticated, loading, currentPage]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Fixed Navbar */}
      <Navbar
        activePage={currentPage}
        pageParams={pageParams}
        onNavigate={navigateTo}
        onOpenAuth={() => navigateTo("login")}
        onOpenEditProfile={() => navigateTo("profile")}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenChat={() => navigateTo("chat")}
        onOpenAddProduct={handleOpenAddProduct}
        onOpenAadhaarVerification={triggerAadhaarModal}
        onToast={showToast}
      />

      {/* Main Routed Page Container */}
      <main className="w-full pt-24 sm:pt-28 md:pt-32 max-w-[1280px] mx-auto px-3 sm:px-4 md:px-gutter-desktop pb-24 md:pb-8 flex-1">
        {currentPage === "home" && (
          <HomePage
            onNavigate={navigateTo}
            onOpenAddProduct={handleOpenAddProduct}
            onQuickRent={handleQuickRent}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "search" && (
          <SearchPage
            initialFilters={pageParams}
            onNavigate={navigateTo}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "product" && (
          <ProductDetailsPage
            productId={pageParams.id || 1}
            onNavigate={navigateTo}
            onOpenChat={() => navigateTo("chat")}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "checkout" && (
          <CheckoutPage
            params={pageParams}
            onNavigate={navigateTo}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "dashboard" && (
          <DashboardPage
            params={pageParams}
            onNavigate={navigateTo}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "orders" && <OrdersPage onNavigate={navigateTo} />}

        {/* Phase 2 Pages */}
        {currentPage === "list-item" && (
          <ListItemPage
            onNavigate={navigateTo}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
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
          <ProfilePage
            params={pageParams}
            onNavigate={navigateTo}
            onOpenAadhaarVerification={triggerAadhaarModal}
            onToast={showToast}
          />
        )}

        {currentPage === "trust-profile" && (
          <PublicTrustProfilePage onNavigate={navigateTo} onToast={showToast} />
        )}

        {currentPage === "return-pass" && (
          <ReturnHandoverPage
            params={pageParams}
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {/* Dedicated Full-Page Login & Register */}
        {currentPage === "login" && (
          <AuthPage
            initialMode="login"
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}

        {currentPage === "register" && (
          <AuthPage
            initialMode="register"
            onNavigate={navigateTo}
            onToast={showToast}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenFullPage={(targetMode) => navigateTo(targetMode)}
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

      {/* Aadhaar Prompt & eKYC Verification Modal */}
      <AadhaarPromptModal
        isOpen={aadhaarModalOpen}
        onClose={() => {
          setAadhaarModalOpen(false);
          setPendingActionAfterAadhaar(null);
        }}
        reason={aadhaarModalReason}
        onSuccess={() => {
          if (typeof pendingActionAfterAadhaar === "function") {
            const cb = pendingActionAfterAadhaar;
            setPendingActionAfterAadhaar(null);
            cb();
          }
        }}
        onNavigate={navigateTo}
        onToast={showToast}
      />

      {/* Global Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Sharekart UI Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/30 flex items-center justify-center text-error mb-4">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">Something went wrong</h1>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            An unexpected display error occurred. Please reload to refresh the marketplace.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 cursor-pointer"
            >
              Go to Home
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-surface-container text-on-surface font-bold rounded-lg border border-outline-variant hover:bg-surface-container-high cursor-pointer"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MarketplaceProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
