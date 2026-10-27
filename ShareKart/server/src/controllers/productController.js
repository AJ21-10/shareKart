import db from '../config/db.js';
import { parseJson } from '../utils/helpers.js';
import { calculateDistanceKm } from '../utils/locationHelper.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      type,
      minPrice,
      maxPrice,
      maxDistance,
      verifiedOnly,
      sort,
      location,
      status = 'active',
      limit = 50
    } = req.query;

    let query = `
      SELECT 
        p.*,
        u.name as seller_name,
        u.avatar_url as seller_avatar,
        u.is_aadhaar_verified as seller_is_verified,
        u.rating as seller_rating,
        c.name as category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (q && q.trim()) {
      query += ` AND (p.title ILIKE ? OR p.description ILIKE ? OR p.subcategory ILIKE ?)`;
      const searchParam = `%${q.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (category && category !== 'all') {
      query += ` AND p.category_id = ?`;
      params.push(category);
    }

    if (type && type !== 'all') {
      if (type === 'rent') {
        query += ` AND (p.transaction_type = 'rent' OR p.transaction_type = 'both')`;
      } else if (type === 'buy') {
        query += ` AND (p.transaction_type = 'buy' OR p.transaction_type = 'both')`;
      }
    }

    if (minPrice) {
      query += ` AND (
        (p.transaction_type = 'rent' AND p.rent_price_daily >= ?) OR 
        (p.transaction_type = 'buy' AND p.sale_price >= ?) OR
        (p.transaction_type = 'both' AND (p.rent_price_daily >= ? OR p.sale_price >= ?))
      )`;
      params.push(Number(minPrice), Number(minPrice), Number(minPrice), Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND (
        (p.transaction_type = 'rent' AND p.rent_price_daily <= ?) OR 
        (p.transaction_type = 'buy' AND p.sale_price <= ?) OR
        (p.transaction_type = 'both' AND (p.rent_price_daily <= ? OR p.sale_price <= ?))
      )`;
      params.push(Number(maxPrice), Number(maxPrice), Number(maxPrice), Number(maxPrice));
    }

    if (!location && maxDistance) {
      query += ` AND p.distance_km <= ?`;
      params.push(Number(maxDistance));
    }

    if (verifiedOnly === 'true' || verifiedOnly === '1' || verifiedOnly === true) {
      query += ` AND u.is_aadhaar_verified = true`;
    }

    const rows = await db.all(query, params);

    let allProducts = rows.map(p => ({
      ...p,
      images: parseJson(p.images, []),
      specs: parseJson(p.specs, {}),
      kit_items: parseJson(p.kit_items, []),
      pickup_locations: parseJson(p.pickup_locations, [])
    }));

    // If user location is passed, compute real distance from location to each product
    if (location) {
      allProducts = allProducts.map(p => ({
        ...p,
        distance_km: calculateDistanceKm(location, p.location_name)
      }));
    }

    const sortByField = (list) => {
      return [...list].sort((a, b) => {
        switch (sort) {
          case 'price_asc': {
            const priceA = a.rent_price_daily > 0 ? a.rent_price_daily : a.sale_price;
            const priceB = b.rent_price_daily > 0 ? b.rent_price_daily : b.sale_price;
            return priceA - priceB;
          }
          case 'price_desc': {
            const priceA = a.rent_price_daily > 0 ? a.rent_price_daily : a.sale_price;
            const priceB = b.rent_price_daily > 0 ? b.rent_price_daily : b.sale_price;
            return priceB - priceA;
          }
          case 'rating':
            return (b.seller_rating || 0) - (a.seller_rating || 0);
          case 'latest':
            return b.id - a.id;
          case 'distance':
          default:
            return a.distance_km - b.distance_km;
        }
      });
    };

    let products = allProducts;
    let nearbySuggestions = [];
    let nearestLocations = [];

    if (location && maxDistance) {
      const radius = Number(maxDistance);
      const filteredInRadius = allProducts.filter(p => p.distance_km <= radius);

      if (filteredInRadius.length > 0) {
        products = sortByField(filteredInRadius).slice(0, Number(limit));
        // Collect extra suggestions outside radius if available
        const outsideRadius = allProducts.filter(p => p.distance_km > radius);
        if (outsideRadius.length > 0) {
          nearbySuggestions = outsideRadius
            .sort((a, b) => a.distance_km - b.distance_km)
            .slice(0, 4);
        }
      } else {
        // Zero products within user's area / radius
        products = [];
        nearbySuggestions = sortByField(allProducts).slice(0, Number(limit));

        const locMap = {};
        for (const item of nearbySuggestions) {
          const locName = item.location_name || 'Gandhinagar';
          if (!locMap[locName]) {
            locMap[locName] = {
              location: locName,
              distance_km: item.distance_km,
              itemCount: 0
            };
          }
          locMap[locName].itemCount++;
        }
        nearestLocations = Object.values(locMap).sort((a, b) => a.distance_km - b.distance_km);
      }
    } else {
      products = sortByField(allProducts).slice(0, Number(limit));
    }

    res.json({
      success: true,
      count: products.length,
      products,
      userLocation: location || null,
      nearbySuggestions,
      nearestLocations
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        u.name as seller_name,
        u.email as seller_email,
        u.phone as seller_phone,
        u.avatar_url as seller_avatar,
        u.location as seller_location,
        u.is_aadhaar_verified as seller_is_verified,
        u.aadhaar_hash as seller_aadhaar_hash,
        u.member_since as seller_member_since,
        u.rating as seller_rating,
        u.reviews_count as seller_reviews_count,
        c.name as category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const product = await db.get(query, [id]);

    if (!product) {
      return res.sendError(404, 'Product not found.', null, 'NOT_FOUND');
    }

    // Parse JSON attributes
    const formatted = {
      ...product,
      images: parseJson(product.images, []),
      specs: parseJson(product.specs, {}),
      kit_items: parseJson(product.kit_items, []),
      pickup_locations: parseJson(product.pickup_locations, [])
    };

    // Fetch reviews for this product
    const reviews = await db.all(`
      SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC
    `, [id]);

    res.json({
      success: true,
      product: formatted,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const seller_id = req.user.id;
    if (!req.user.is_aadhaar_verified) {
      return res.sendError(403, 'Aadhaar verification is required to list products. Please verify your Aadhaar to continue.', null, 'AADHAAR_REQUIRED');
    }
    const {
      title,
      category_id,
      subcategory,
      description,
      condition_tag = 'Used - Excellent',
      condition_score = '9 / 10',
      transaction_type = 'both',
      rent_price_daily = 0,
      rent_price_weekly = 0,
      security_deposit = 0,
      sale_price = 0,
      original_mrp = 0,
      images,
      specs,
      kit_items,
      pickup_locations,
      location_name = req.user.location,
      distance_km = 1.5
    } = req.body;

    if (!title || !category_id || !transaction_type) {
      return res.sendError(400, 'Title, category, and transaction type are required.', null, 'BAD_REQUEST');
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
    ];

    const imageArray = Array.isArray(images) && images.length > 0 ? images : defaultImages;

    const sql = `
      INSERT INTO products (
        seller_id, title, category_id, subcategory, description,
        condition_tag, condition_score, transaction_type, rent_price_daily,
        rent_price_weekly, security_deposit, sale_price, original_mrp,
        images, specs, kit_items, pickup_locations, location_name, distance_km, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, 'active'
      )
      RETURNING id
    `;

    const result = await db.run(sql, [
      seller_id,
      title,
      category_id,
      subcategory || '',
      description || '',
      condition_tag,
      condition_score,
      transaction_type,
      Number(rent_price_daily) || 0,
      Number(rent_price_weekly) || (Number(rent_price_daily) * 6) || 0,
      Number(security_deposit) || 0,
      Number(sale_price) || 0,
      Number(original_mrp) || 0,
      JSON.stringify(imageArray),
      JSON.stringify(specs || {}),
      JSON.stringify(kit_items || []),
      JSON.stringify(pickup_locations || [location_name]),
      location_name,
      Number(distance_km) || 1.5
    ]);

    // Increment category item count
    await db.run('UPDATE categories SET item_count = item_count + 1 WHERE id = ?', [category_id]);

    const newProductId = result.lastInsertRowid || result.rows?.[0]?.id;

    res.setHeader('Location', `/api/products/${newProductId}`);

    res.status(201).json({
      success: true,
      message: 'Product listed successfully on Sharekart!',
      productId: newProductId
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, rent_price_daily, sale_price, security_deposit } = req.body;

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.sendError(404, 'Product not found.', null, 'NOT_FOUND');
    }

    if (product.seller_id !== userId) {
      return res.sendError(403, 'You can only update your own listings.', null, 'FORBIDDEN');
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (rent_price_daily !== undefined) {
      updates.push('rent_price_daily = ?');
      params.push(Number(rent_price_daily));
    }
    if (sale_price !== undefined) {
      updates.push('sale_price = ?');
      params.push(Number(sale_price));
    }
    if (security_deposit !== undefined) {
      updates.push('security_deposit = ?');
      params.push(Number(security_deposit));
    }

    if (updates.length > 0) {
      params.push(id);
      await db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
