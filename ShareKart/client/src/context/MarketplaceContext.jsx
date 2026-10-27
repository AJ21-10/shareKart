import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  MARKETPLACE_HUBS,
  FEATURE_PILLARS,
  HOW_IT_WORKS_STEPS,
  TRUST_BADGES,
  VALUE_PROPS
} from "../data/initialData";
import { api } from "../services/api";
import { calculateDistanceKm } from "../services/locationService";

const MarketplaceContext = createContext(null);

const STORAGE_CUSTOM_PRODUCTS = "sharekart_custom_products";
const STORAGE_DELETED_IDS = "sharekart_deleted_product_ids";

export const MarketplaceProvider = ({ children }) => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES || []);
  const [hubs, setHubs] = useState(MARKETPLACE_HUBS || []);
  const [products, setProducts] = useState(() => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_IDS) || "[]");
      const customProducts = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS) || "[]");
      const safeDeleted = Array.isArray(deletedIds) ? deletedIds : [];
      const safeCustom = Array.isArray(customProducts) ? customProducts : [];
      const baseList = (INITIAL_PRODUCTS || []).filter(p => p && !safeDeleted.includes(p.id));
      return [...safeCustom, ...baseList];
    } catch {
      return INITIAL_PRODUCTS || [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync with API when available while respecting initialData additions
  useEffect(() => {
    refreshFromApi();
  }, []);

  const refreshFromApi = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.allSettled([
        api.getProducts(),
        api.getCategories()
      ]);

      if (catRes.status === "fulfilled" && catRes.value?.success && Array.isArray(catRes.value.categories) && catRes.value.categories.length > 0) {
        // Merge backend categories with any extras from initialData
        const apiCatIds = new Set(catRes.value.categories.map(c => c.id));
        const extraCats = (INITIAL_CATEGORIES || []).filter(c => !apiCatIds.has(c.id));
        setCategories([...catRes.value.categories, ...extraCats]);
      }

      if (prodRes.status === "fulfilled" && prodRes.value?.success && Array.isArray(prodRes.value.products) && prodRes.value.products.length > 0) {
        const deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_IDS) || "[]");
        const customProducts = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS) || "[]");
        const safeDeleted = Array.isArray(deletedIds) ? deletedIds : [];
        const safeCustom = Array.isArray(customProducts) ? customProducts : [];
        const apiList = prodRes.value.products.filter(p => p && !safeDeleted.includes(p.id));

        // Merge initialData products that might not be in the database seed yet
        const apiProductIds = new Set(apiList.map(p => p.id));
        const extraInitial = (INITIAL_PRODUCTS || []).filter(p => p && !apiProductIds.has(p.id) && !safeDeleted.includes(p.id));

        setProducts([...safeCustom, ...apiList, ...extraInitial]);
      }
    } catch (err) {
      console.warn("MarketplaceContext API sync fallback to initialData", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a product dynamically (stored locally and in state)
   */
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: newProduct.id || Date.now(),
      status: newProduct.status || "active",
      created_at: newProduct.created_at || new Date().toISOString()
    };

    setProducts(prev => [productWithId, ...prev]);

    try {
      const customProducts = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS) || "[]");
      localStorage.setItem(STORAGE_CUSTOM_PRODUCTS, JSON.stringify([productWithId, ...customProducts]));
    } catch (e) {
      console.error("Failed to save custom product to storage", e);
    }

    return productWithId;
  };

  /**
   * Delete a product by ID dynamically
   */
  const deleteProduct = (id) => {
    const targetId = Number(id);
    setProducts(prev => prev.filter(p => p.id !== targetId));

    try {
      const deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_IDS) || "[]");
      if (!deletedIds.includes(targetId)) {
        deletedIds.push(targetId);
        localStorage.setItem(STORAGE_DELETED_IDS, JSON.stringify(deletedIds));
      }
      const customProducts = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS) || "[]");
      const filteredCustom = customProducts.filter(p => p.id !== targetId);
      localStorage.setItem(STORAGE_CUSTOM_PRODUCTS, JSON.stringify(filteredCustom));
    } catch (e) {
      console.error("Failed to delete product from storage", e);
    }
  };

  /**
   * Update a product by ID dynamically
   */
  const updateProduct = (id, updates) => {
    const targetId = Number(id);
    setProducts(prev =>
      prev.map(p => (p.id === targetId ? { ...p, ...updates } : p))
    );
  };

  /**
   * Find product by ID
   */
  const getProductById = (id) => {
    const targetId = Number(id);
    return products.find(p => p.id === targetId) || null;
  };

  /**
   * Filter products by category, transaction type, search term, and user location
   */
  const filterProducts = ({
    category = "all",
    type = "all",
    query = "",
    location = "",
    maxDistance = 25,
    verifiedOnly = false
  } = {}) => {
    let result = products.map(p => {
      const dist = location ? calculateDistanceKm(location, p.location_name) : (p.distance_km || 2.5);
      return { ...p, distance_km: dist };
    });

    if (category && category !== "all") {
      result = result.filter(p => p.category_id === category);
    }

    if (type && type !== "all") {
      result = result.filter(p => p.transaction_type === type || p.transaction_type === "both");
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q)
      );
    }

    if (verifiedOnly) {
      result = result.filter(p => p.seller_is_verified);
    }

    const inRadius = location && maxDistance
      ? result.filter(p => p.distance_km <= Number(maxDistance))
      : result;

    const nearby = location && inRadius.length === 0
      ? [...result].sort((a, b) => a.distance_km - b.distance_km)
      : [];

    return {
      products: inRadius.sort((a, b) => a.distance_km - b.distance_km),
      nearbySuggestions: nearby,
      totalCount: inRadius.length
    };
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        categories,
        hubs,
        featurePillars: FEATURE_PILLARS,
        howItWorks: HOW_IT_WORKS_STEPS,
        trustBadges: TRUST_BADGES,
        valueProps: VALUE_PROPS,
        loading,
        addProduct,
        deleteProduct,
        updateProduct,
        getProductById,
        filterProducts,
        refreshFromApi
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};
