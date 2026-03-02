import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name,
      email,
      phone,
      service_type,
      preferred_date,
      preferred_time,
      message,
      services,
      consultation_fee,
    } = req.body;

    const user_id = req.user ? req.user.id : null;

    await client.query('BEGIN');

    const total_amount = services.reduce((sum, s) => sum + parseFloat(s.price), 0) + parseFloat(consultation_fee || 100);

    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, name, email, phone, service_type, preferred_date, preferred_time, message, total_amount, consultation_fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [user_id, name, email, phone, service_type, preferred_date, preferred_time, message, total_amount, consultation_fee]
    );

    const booking = bookingResult.rows[0];

    for (const service of services) {
      await client.query(
        'INSERT INTO booking_services (booking_id, service_name, service_price) VALUES ($1, $2, $3)',
        [booking.id, service.name, service.price]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(booking);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
       COALESCE(json_agg(
         json_build_object('id', bs.id, 'service_name', bs.service_name, 'service_price', bs.service_price)
       ) FILTER (WHERE bs.id IS NOT NULL), '[]') as services
       FROM bookings b
       LEFT JOIN booking_services bs ON b.id = bs.booking_id
       WHERE b.user_id = $1 OR b.email = $2
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [req.user.id, req.user.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
       COALESCE(json_agg(
         json_build_object('id', bs.id, 'service_name', bs.service_name, 'service_price', bs.service_price)
       ) FILTER (WHERE bs.id IS NOT NULL), '[]') as services
       FROM bookings b
       LEFT JOIN booking_services bs ON b.id = bs.booking_id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, payment_method } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (payment_status) {
      updates.push(`payment_status = $${paramCount++}`);
      values.push(payment_status);
    }
    if (payment_method) {
      updates.push(`payment_method = $${paramCount++}`);
      values.push(payment_method);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
