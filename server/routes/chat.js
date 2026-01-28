const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const db = require('../db');

// Get chat history for a specific appeal
router.get('/:appealId', auth, async (req, res) => {
    try {
        const { appealId } = req.params;
        const result = await db.query(
            `SELECT role, content, created_at FROM chat_messages 
             WHERE user_id = $1 AND appeal_id = $2 
             ORDER BY created_at ASC`,
            [req.user.id, appealId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { message, context, appealId } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

        if (!apiKey || apiKey.length < 20 || apiKey.includes('your_')) {
            return res.json({
                response: "I'm sorry, but I can't process your request right now because the AI service is not configured correctly."
            });
        }

        // Save user message
        if (appealId) {
            await db.query(
                `INSERT INTO chat_messages (user_id, appeal_id, role, content) VALUES ($1, $2, $3, $4)`,
                [req.user.id, appealId, 'user', message]
            );
        }

        const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined
        });

        // Fetch recent history for context (optional, but good for conversation flow)
        let history = [];
        if (appealId) {
            const historyRes = await db.query(
                `SELECT role, content FROM chat_messages 
                 WHERE user_id = $1 AND appeal_id = $2 
                 ORDER BY created_at DESC LIMIT 5`,
                [req.user.id, appealId]
            );
            history = historyRes.rows.reverse(); // Newest last for AI
        }

        const systemPrompt = `You are a highly experienced Medical Billing & Coding Expert Assistant.
        You are helping a user edit an appeal letter for a denied medical claim.
        
        Current Appeal Context:
        Patient: ${context.patient_name || 'Unknown'}
        Denial Reason: ${context.denial_reason || 'Unknown'}
        Current Appeal Letter Draft:
        "${context.appeal_letter ? context.appeal_letter.substring(0, 2000) : ''}..."

        Your Goal:
        Answer the user's questions about the appeal, suggest improvements, explain medical coding terms (CPT, ICD-10), or rewrite sections of the letter if asked.
        Be professional, encouraging, and precise.
        Keep responses concise unless asked for a detailed explanation.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: "user", content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: isOpenRouter ? "openai/gpt-4o" : "gpt-4o",
            messages: messages,
            max_tokens: 500
        });

        const reply = completion.choices[0].message.content;

        // Save AI response
        if (appealId) {
            await db.query(
                `INSERT INTO chat_messages (user_id, appeal_id, role, content) VALUES ($1, $2, $3, $4)`,
                [req.user.id, appealId, 'assistant', reply]
            );
        }

        res.json({ response: reply });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

module.exports = router;
