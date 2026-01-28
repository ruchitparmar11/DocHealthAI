const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_appeals,
                SUM(claim_amount) as total_revenue,
                (SELECT COUNT(*) FROM appeals WHERE status = 'Successful') as successful_appeals
            FROM appeals
        `);

        const row = stats.rows[0];
        const total = parseInt(row.total_appeals);
        const successful = parseInt(row.successful_appeals || 0);
        const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

        // Get Chart Data (Last 7 days)
        const chartResult = await db.query(`
            SELECT TO_CHAR(created_at, 'Mon DD') as name, SUM(claim_amount) as value
            FROM appeals
            GROUP BY name, DATE(created_at)
            ORDER BY DATE(created_at) ASC
            LIMIT 7
        `);

        // Get Denial Reasons Breakdown
        const reasonsResult = await db.query(`
            SELECT denial_reason, COUNT(*) as count
            FROM appeals
            GROUP BY denial_reason
            ORDER BY count DESC
            LIMIT 5
        `);

        // Process reasons for chart (shorten long reasons)
        const reasonsData = reasonsResult.rows.map(row => {
            // Simple logic to categorize or shorten reason
            let name = row.denial_reason || 'Unknown';
            if (name.includes('Medical Necessity')) name = 'Medical Necessity';
            else if (name.includes('CO-50')) name = 'Medical Necessity (CO-50)';
            else if (name.includes('coding')) name = 'Coding Error';
            else if (name.length > 20) name = name.substring(0, 20) + '...';

            return {
                name: name,
                value: parseInt(row.count)
            };
        });

        // Get Recent Activity
        const recentResult = await db.query(`
            SELECT id, patient_name, denial_reason, status, claim_amount, created_at 
            FROM appeals 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        res.json({
            total_appeals: total,
            total_revenue: row.total_revenue || 0,
            success_rate: successRate,
            chart_data: chartResult.rows,
            reason_data: reasonsData,
            recent_activity: recentResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM appeals ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM appeals WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appeal not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { appeal_letter, patient_name, status, claim_amount } = req.body;

        // Dynamic update query construction would be better, but for now we extend the specific query or checking what's provided
        // Let's assume we want to support status update if provided.

        let result;
        if (status) {
            result = await db.query(
                `UPDATE appeals 
                 SET appeal_letter = COALESCE($1, appeal_letter), 
                     patient_name = COALESCE($2, patient_name),
                     status = $3
                 WHERE id = $4 RETURNING *`,
                [appeal_letter, patient_name, status, id]
            );
        } else {
            result = await db.query(
                'UPDATE appeals SET appeal_letter = $1, patient_name = $2 WHERE id = $3 RETURNING *',
                [appeal_letter, patient_name, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appeal not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
