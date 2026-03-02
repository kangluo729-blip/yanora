import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE user_id = $1 AND is_active = true',
      [user.id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const admin = adminResult.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/admins', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.user_id, a.email, a.role, a.is_active, a.created_at, a.updated_at
       FROM admins a
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to get admins' });
  }
});

router.post('/admins', authenticateAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, role } = req.body;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create admins' });
    }

    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [email, passwordHash]
      );

      userId = userResult.rows[0].id;
    }

    const adminResult = await client.query(
      'INSERT INTO admins (user_id, email, role) VALUES ($1, $2, $3) RETURNING *',
      [userId, email, role || 'admin']
    );

    await client.query('COMMIT');

    res.status(201).json(adminResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create admin error:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    res.status(500).json({ error: 'Failed to create admin' });
  } finally {
    client.release();
  }
});

router.patch('/admins/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, is_active } = req.body;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can update admins' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE admins SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

router.delete('/admins/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete admins' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const result = await pool.query(
      'DELETE FROM admins WHERE user_id = $1 RETURNING *',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

export default router;
