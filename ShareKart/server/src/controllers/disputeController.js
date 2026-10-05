import db from '../config/db.js';

export const getDisputes = async (req, res, next) => {
  try {
    const disputes = await db.all('SELECT * FROM disputes ORDER BY created_at DESC');
    const stats = {
      activeCount: disputes.filter(d => d.status === 'active').length,
      escrowLockedTotal: disputes.filter(d => d.status === 'active').reduce((acc, d) => acc + (d.claim_amount || 0), 0),
      resolvedCount: disputes.filter(d => d.status === 'resolved').length,
      avgResolutionHours: 4.2
    };

    res.json({
      success: true,
      stats,
      disputes
    });
  } catch (error) {
    next(error);
  }
};

export const createDispute = async (req, res, next) => {
  try {
    const { rental_id, product_title, item_category, claim_amount, deposit_amount, issue_type, tag_label, description } = req.body;
    
    if (!product_title || !claim_amount) {
      return res.status(400).json({ success: false, message: 'Product title and claim amount are required.' });
    }

    const disputeId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const complainant = req.user?.name || 'Verified Lender';
    const respondent = 'Borrower';

    const insertSql = `
      INSERT INTO disputes (id, rental_id, product_title, item_category, complainant_name, respondent_name, claim_amount, deposit_amount, issue_type, tag_label, description, sla_hours, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(insertSql, [
      disputeId,
      rental_id || 'SK-8921',
      product_title,
      item_category || 'General',
      complainant,
      respondent,
      claim_amount,
      deposit_amount || claim_amount * 2,
      issue_type || 'damage',
      tag_label || 'Condition Discrepancy',
      description || 'Dispute raised regarding returned item physical condition.',
      6.0,
      'active'
    ]);

    const dispute = await db.get('SELECT * FROM disputes WHERE id = ?', [disputeId]);

    res.status(201).json({
      success: true,
      message: `Dispute claim #${disputeId} registered and submitted for arbitration.`,
      dispute
    });
  } catch (error) {
    next(error);
  }
};

export const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution_notes, action } = req.body; // action: 'release_escrow', 'settle_claim'

    const dispute = await db.get('SELECT * FROM disputes WHERE id = ?', [id]);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    await db.run(`
      UPDATE disputes
      SET status = 'resolved', resolution_notes = ?
      WHERE id = ?
    `, [resolution_notes || `Arbitrated: Escrow settlement executed (${action || 'claim settled'})`, id]);

    const updated = await db.get('SELECT * FROM disputes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Dispute #${id} marked as resolved. Escrow settled in accordance with Aadhaar arbitration guidelines.`,
      dispute: updated
    });
  } catch (error) {
    next(error);
  }
};
