import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM faq_categories
       WHERE is_active = true
       ORDER BY display_order ASC, created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = `
      SELECT f.*, c.name_zh as category_name_zh, c.name_en as category_name_en,
             c.name_fr as category_name_fr, c.name_ar as category_name_ar, c.name_es as category_name_es
      FROM faqs f
      LEFT JOIN faq_categories c ON f.category_id = c.id
      WHERE f.is_active = true
    `;
    const params = [];

    if (category_id) {
      query += ' AND f.category_id = $1';
      params.push(category_id);
    }

    query += ' ORDER BY f.display_order ASC, f.created_at ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name_zh, name_en, name_fr, name_ar, name_es, display_order } = req.body;

    if (!name_zh || !name_en) {
      return res.status(400).json({ error: 'Chinese and English names are required' });
    }

    const result = await pool.query(
      `INSERT INTO faq_categories (name_zh, name_en, name_fr, name_ar, name_es, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name_zh, name_en, name_fr || name_en, name_ar || name_en, name_es || name_en, display_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    res.status(500).json({ error: 'Failed to create FAQ category' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      category_id,
      question_zh, question_en, question_fr, question_ar, question_es,
      answer_zh, answer_en, answer_fr, answer_ar, answer_es,
      display_order
    } = req.body;

    if (!question_zh || !question_en || !answer_zh || !answer_en) {
      return res.status(400).json({ error: 'Chinese and English questions and answers are required' });
    }

    const result = await pool.query(
      `INSERT INTO faqs (
        category_id,
        question_zh, question_en, question_fr, question_ar, question_es,
        answer_zh, answer_en, answer_fr, answer_ar, answer_es,
        display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        category_id,
        question_zh, question_en, question_fr || question_en, question_ar || question_en, question_es || question_en,
        answer_zh, answer_en, answer_fr || answer_en, answer_ar || answer_en, answer_es || answer_en,
        display_order || 0
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name_zh, name_en, name_fr, name_ar, name_es, display_order, is_active } = req.body;

    const result = await pool.query(
      `UPDATE faq_categories
       SET name_zh = COALESCE($1, name_zh),
           name_en = COALESCE($2, name_en),
           name_fr = COALESCE($3, name_fr),
           name_ar = COALESCE($4, name_ar),
           name_es = COALESCE($5, name_es),
           display_order = COALESCE($6, display_order),
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name_zh, name_en, name_fr, name_ar, name_es, display_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    res.status(500).json({ error: 'Failed to update FAQ category' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      question_zh, question_en, question_fr, question_ar, question_es,
      answer_zh, answer_en, answer_fr, answer_ar, answer_es,
      display_order, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE faqs
       SET category_id = COALESCE($1, category_id),
           question_zh = COALESCE($2, question_zh),
           question_en = COALESCE($3, question_en),
           question_fr = COALESCE($4, question_fr),
           question_ar = COALESCE($5, question_ar),
           question_es = COALESCE($6, question_es),
           answer_zh = COALESCE($7, answer_zh),
           answer_en = COALESCE($8, answer_en),
           answer_fr = COALESCE($9, answer_fr),
           answer_ar = COALESCE($10, answer_ar),
           answer_es = COALESCE($11, answer_es),
           display_order = COALESCE($12, display_order),
           is_active = COALESCE($13, is_active),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        category_id,
        question_zh, question_en, question_fr, question_ar, question_es,
        answer_zh, answer_en, answer_fr, answer_ar, answer_es,
        display_order, is_active, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM faq_categories WHERE id = $1', [id]);

    res.json({ message: 'FAQ category deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ category:', error);
    res.status(500).json({ error: 'Failed to delete FAQ category' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM faqs WHERE id = $1', [id]);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

export default router;
