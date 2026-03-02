import express from 'express';
import pool from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/simple', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM simple_cases WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get simple cases error:', error);
    res.status(500).json({ error: 'Failed to get simple cases' });
  }
});

router.get('/simple/all', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM simple_cases ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all simple cases error:', error);
    res.status(500).json({ error: 'Failed to get simple cases' });
  }
});

router.post('/simple', authenticateAdmin, async (req, res) => {
  try {
    const { before_image_url, after_image_url, is_active, display_order } = req.body;

    const result = await pool.query(
      'INSERT INTO simple_cases (before_image_url, after_image_url, is_active, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [before_image_url, after_image_url, is_active ?? true, display_order ?? 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create simple case error:', error);
    res.status(500).json({ error: 'Failed to create simple case' });
  }
});

router.patch('/simple/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { before_image_url, after_image_url, is_active, display_order } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (before_image_url !== undefined) {
      updates.push(`before_image_url = $${paramCount++}`);
      values.push(before_image_url);
    }
    if (after_image_url !== undefined) {
      updates.push(`after_image_url = $${paramCount++}`);
      values.push(after_image_url);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE simple_cases SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simple case not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update simple case error:', error);
    res.status(500).json({ error: 'Failed to update simple case' });
  }
});

router.delete('/simple/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM simple_cases WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simple case not found' });
    }

    res.json({ message: 'Simple case deleted successfully' });
  } catch (error) {
    console.error('Delete simple case error:', error);
    res.status(500).json({ error: 'Failed to delete simple case' });
  }
});

router.get('/detailed', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM detailed_cases WHERE is_active = true';
    const values = [];

    if (category) {
      query += ' AND category = $1';
      values.push(category);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get detailed cases error:', error);
    res.status(500).json({ error: 'Failed to get detailed cases' });
  }
});

router.get('/detailed/all', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM detailed_cases ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all detailed cases error:', error);
    res.status(500).json({ error: 'Failed to get detailed cases' });
  }
});

router.post('/detailed', authenticateAdmin, async (req, res) => {
  try {
    const {
      surgery_name,
      before_image_url,
      after_image_url,
      before_features,
      after_features,
      category,
      is_featured,
      is_active,
      display_order,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO detailed_cases
       (surgery_name, before_image_url, after_image_url, before_features, after_features, category, is_featured, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        surgery_name,
        before_image_url,
        after_image_url,
        JSON.stringify(before_features || []),
        JSON.stringify(after_features || []),
        category,
        is_featured ?? false,
        is_active ?? true,
        display_order ?? 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create detailed case error:', error);
    res.status(500).json({ error: 'Failed to create detailed case' });
  }
});

router.patch('/detailed/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      surgery_name,
      before_image_url,
      after_image_url,
      before_features,
      after_features,
      category,
      is_featured,
      is_active,
      display_order,
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (surgery_name !== undefined) {
      updates.push(`surgery_name = $${paramCount++}`);
      values.push(surgery_name);
    }
    if (before_image_url !== undefined) {
      updates.push(`before_image_url = $${paramCount++}`);
      values.push(before_image_url);
    }
    if (after_image_url !== undefined) {
      updates.push(`after_image_url = $${paramCount++}`);
      values.push(after_image_url);
    }
    if (before_features !== undefined) {
      updates.push(`before_features = $${paramCount++}`);
      values.push(JSON.stringify(before_features));
    }
    if (after_features !== undefined) {
      updates.push(`after_features = $${paramCount++}`);
      values.push(JSON.stringify(after_features));
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      values.push(is_featured);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE detailed_cases SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detailed case not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update detailed case error:', error);
    res.status(500).json({ error: 'Failed to update detailed case' });
  }
});

router.delete('/detailed/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM detailed_cases WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detailed case not found' });
    }

    res.json({ message: 'Detailed case deleted successfully' });
  } catch (error) {
    console.error('Delete detailed case error:', error);
    res.status(500).json({ error: 'Failed to delete detailed case' });
  }
});

export default router;
