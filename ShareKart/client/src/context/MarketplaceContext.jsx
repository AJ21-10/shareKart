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
      const safeCustom = (Array.isArray(customProducts) ? customProducts : [])
        .map(p => {
          if (!p) return null;
          const cleanedImages = Array.isArray(p.images)
            ? p.images.filter(img => typeof img === 'string' && !img.startsWith('blob:'))
            : [];
          return {
            ...p,
            images: cleanedImages.length > 0 ? cleanedImages : [
              p.image && !p.image.startsWith('blob:') ? p.image : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
            ]
          };
        })
        .filter(Boolean);
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

        // Always keep INITIAL_PRODUCTS from initialData.js as primary source
        const initialIds = new Set((INITIAL_PRODUCTS || []).map(p => p.id));
        const extraFromApi = apiList.filter(p => !initialIds.has(p.id));
        const baseList = (INITIAL_PRODUCTS || []).filter(p => p && !safeDeleted.includes(p.id));

        setProducts([...safeCustom, ...baseList, ...extraFromApi]);
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
   * Find product by ID (supports number 6, string '6', or formatted '#SK-6')
   */
  const getProductById = (id) => {
    if (id === null || id === undefined) return null;
    const cleanId = String(id).replace(/^[#\s]*SK-?/i, "").trim();
    const numId = Number(cleanId);

    // Look in current products state first
    let found = (products || []).find(p => p && (
      p.id === numId ||
      String(p.id) === String(id) ||
      String(p.id) === cleanId
    ));

    // Direct fallback to INITIAL_PRODUCTS from initialData.js
    if (!found) {
      found = (INITIAL_PRODUCTS || []).find(p => p && (
        p.id === numId ||
        String(p.id) === String(id) ||
        String(p.id) === cleanId
      ));
    }

    return found || null;
  };

  /**
   * Filter products by category, transaction type, search term, price, and user location
   * Root source is always initialData.js (plus user-added custom products)
   */
  const filterProducts = ({
    category = "all",
    type = "all",
    query = "",
    location = "",
    maxDistance = 25,
    verifiedOnly = false,
    minPrice = "",
    maxPrice = "",
    sort = "distance"
  } = {}) => {
    const sourceList = (products && products.length > 0) ? products : (INITIAL_PRODUCTS || []);
    let result = sourceList.map(p => {
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

    if (minPrice !== "" && !isNaN(Number(minPrice))) {
      result = result.filter(p => {
        const price = p.transaction_type === 'rent' ? p.rent_price_daily : (p.sale_price || p.rent_price_daily);
        return (price || 0) >= Number(minPrice);
      });
    }

    if (maxPrice !== "" && !isNaN(Number(maxPrice))) {
      result = result.filter(p => {
        const price = p.transaction_type === 'rent' ? p.rent_price_daily : (p.sale_price || p.rent_price_daily);
        return (price || 0) <= Number(maxPrice);
      });
    }

    // Sort order
    if (sort === "price-asc") {
      result.sort((a, b) => {
        const priceA = a.rent_price_daily || a.sale_price || 0;
        const priceB = b.rent_price_daily || b.sale_price || 0;
        return priceA - priceB;
      });
    } else if (sort === "price-desc") {
      result.sort((a, b) => {
        const priceA = a.rent_price_daily || a.sale_price || 0;
        const priceB = b.rent_price_daily || b.sale_price || 0;
        return priceB - priceA;
      });
    } else if (sort === "rating") {
      result.sort((a, b) => (b.seller_rating || 0) - (a.seller_rating || 0));
    } else {
      // default: distance
      result.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    const inRadius = location && maxDistance
      ? result.filter(p => p.distance_km <= Number(maxDistance))
      : result;

    const nearby = location && inRadius.length === 0
      ? [...result].sort((a, b) => a.distance_km - b.distance_km)
      : [];

    return {
      products: inRadius,
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
