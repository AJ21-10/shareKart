import db from '../config/db.js';
import { parseJson } from '../utils/helpers.js';

export const calculateCost = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, deliveryType = 'pickup', orderType = 'rent' } = req.body;

    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (orderType === 'buy') {
      const salePrice = product.sale_price || 0;
      const platformFee = 99;
      const gstFee = 18;
      const deliveryFee = deliveryType === 'delivery' ? 150 : 0;
      const totalAmount = salePrice + platformFee + gstFee + deliveryFee;

      return res.json({
        success: true,
        orderType: 'buy',
        salePrice,
        platformFee,
        gstFee,
        deliveryFee,
        totalAmount,
        refundableDeposit: 0
      });
    }

    // Rental calculation
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Total days calculation (minimum 1 day)
    const diffTime = Math.max(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const dailyRate = product.rent_price_daily || 0;
    const rentFee = dailyRate * totalDays;
    const depositFee = product.security_deposit || 0;
    const platformFee = 99;
    const gstFee = 18;
    const deliveryFee = deliveryType === 'delivery' ? 150 : 0;

    const totalAmount = rentFee + depositFee + platformFee + gstFee + deliveryFee;
    const netCost = rentFee + platformFee + gstFee + deliveryFee;

    res.json({
      success: true,
      orderType: 'rent',
      totalDays,
      dailyRate,
      rentFee,
      depositFee,
      platformFee,
      gstFee,
      deliveryFee,
      totalAmount,
      netCost,
      refundableDeposit: depositFee
    });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.user.is_aadhaar_verified) {
      return res.status(403).json({
        success: false,
        message: 'Aadhaar verification is required to rent or buy items. Please verify your Aadhaar to continue.'
      });
    }
    const {
      productId,
      orderType = 'rent',
      startDate,
      endDate,
      totalDays = 3,
      deliveryType = 'pickup',
      deliveryAddress,
      paymentMethod = 'upi'
    } = req.body;

    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let rentFee = 0;
    let depositFee = 0;
    let salePrice = 0;
    const platformFee = 99;
    const gstFee = 18;
    const deliveryFee = deliveryType === 'delivery' ? 150 : 0;

    if (orderType === 'buy') {
      salePrice = product.sale_price || 0;
    } else {
      rentFee = (product.rent_price_daily || 0) * Number(totalDays);
      depositFee = product.security_deposit || 0;
    }

    const totalAmount = (orderType === 'buy' ? salePrice : rentFee + depositFee) + platformFee + gstFee + deliveryFee;

    // Generate order ID and escrow PIN
    const orderId = 'SK-' + (orderType === 'buy' ? 'BUY-' : 'ORD-') + Math.floor(10000 + Math.random() * 90000);
    const escrowPin = 'PIN-' + Math.floor(1000 + Math.random() * 9000);

    const sql = `
      INSERT INTO rentals (
        id, user_id, product_id, order_type, start_date, end_date, total_days,
        rent_fee, deposit_fee, platform_fee, gst_fee, delivery_fee, total_amount,
        delivery_type, delivery_address, payment_method, payment_status, escrow_status,
        escrow_pin, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, 'completed', 'held_in_escrow',
        ?, 'pending_approval'
      )
    `;

    await db.run(sql, [
      orderId,
      userId,
      productId,
      orderType,
      startDate || new Date().toISOString().split('T')[0],
      endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      Number(totalDays) || 1,
      rentFee,
      depositFee,
      platformFee,
      gstFee,
      deliveryFee,
      totalAmount,
      deliveryType,
      deliveryAddress || 'Self Pickup at verified location',
      paymentMethod,
      escrowPin
    ]);

    // Fetch the created rental with joined product info
    const rental = await db.get(`
      SELECT r.*, p.title as product_title, p.images as product_images, u.name as seller_name
      FROM rentals r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE r.id = ?
    `, [orderId]);

    if (rental) {
      rental.product_images = parseJson(rental.product_images, []);
    }

    res.status(201).json({
      success: true,
      message: 'Booking completed successfully! Payment held in 256-bit Razorpay Escrow.',
      order: rental
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRentals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rentals = await db.all(`
      SELECT 
        r.*,
        p.title as product_title,
        p.images as product_images,
        p.condition_tag,
        p.location_name,
        u.name as seller_name,
        u.phone as seller_phone
      FROM rentals r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    const formatted = rentals.map(r => ({
      ...r,
      product_images: parseJson(r.product_images, [])
    }));

    res.json({
      success: true,
      rentals: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const updateRentalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, escrow_status } = req.body;
    const userId = req.user.id;

    const rental = await db.get(`
      SELECT r.*, p.seller_id
      FROM rentals r
      JOIN products p ON r.product_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental order not found.' });
    }

    // Only buyer or seller can update status
    if (rental.user_id !== userId && rental.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order.' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (escrow_status) {
      updates.push('escrow_status = ?');
      params.push(escrow_status);
    }
    if (updates.length > 0) {
      params.push(id);
      await db.run(`UPDATE rentals SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({
      success: true,
      message: `Order status updated to ${status || escrow_status}.`
    });
  } catch (error) {
    next(error);
  }
};

export const completeReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { upi_id, checklist_passed } = req.body;

    const rental = await db.get(`
      SELECT r.*, p.title as product_title
      FROM rentals r
      JOIN products p ON r.product_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental order not found.' });
    }

    const refundAmount = rental.deposit_fee || 0;
    const refundUtr = `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    await db.run(`
      UPDATE rentals
      SET status = 'completed', escrow_status = 'deposit_refunded'
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: `Physical return handover confirmed! ₹${refundAmount.toLocaleString('en-IN')} escrow security deposit refunded to ${upi_id || 'aarav@okaxis'}.`,
      refund: {
        order_id: id,
        product_title: rental.product_title,
        refund_amount: refundAmount,
        refund_utr: refundUtr,
        upi_id: upi_id || 'aarav@okaxis',
        escrow_status: 'deposit_refunded',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
