const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/emailService');
const auth = require('../middleware/auth');

// @route   POST /email/send
// @desc    Send appeal letter via email
// @access  Private
router.post('/send', auth, async (req, res) => {
    const { to, subject, appeal_text, patient_name } = req.body;

    if (!to || !subject || !appeal_text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Construct the email body
        const emailBody = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Appeal Letter Generated</h1>
                </div>
                
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="margin-bottom: 20px;">Hello,</p>
                    <p style="margin-bottom: 20px;">Please find below the appeal letter generated for <strong>${patient_name || 'the patient'}</strong>.</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                        <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: #374151;">${appeal_text}</pre>
                    </div>

                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                        This email was sent securely via <strong>ClaimHealth</strong>.
                    </p>
                </div>
            </div>
        `;

        await sendEmail(to, subject, appeal_text, emailBody);

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email API Error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;
