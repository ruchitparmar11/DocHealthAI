const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

// Configure Multer
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the uploaded file
        const dataBuffer = fs.readFileSync(req.file.path);

        // Parse PDF (Standard 1.1.1 usage)
        const data = await pdf(dataBuffer);

        // Text extraction
        const text = data.text;

        console.log('Extracted text length:', text.length);

        // AI Analysis Logic
        let analysisResult = {
            denialReason: "Analysis pending (AI)",
            appealLetter: "Appeal generation pending (AI)",
            cptCodes: []
        };

        const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

        if (apiKey && apiKey.length > 20 && !apiKey.includes('your_')) {
            try {
                const OpenAI = require('openai');
                const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

                const openai = new OpenAI({
                    apiKey: apiKey,
                    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined
                });

                const completion = await openai.chat.completions.create({
                    model: isOpenRouter ? "openai/gpt-4o" : "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a medical billing expert and professional appeal letter writer. 
              Analyze the provided medical claim denial letter text. 
              1. Identify the specific Denial Reason / Reason Code (e.g., CO-15, CO-50).
              2. Identify the Patient Name (if any) and Date of Service.
              3. Identify the Total Claim Amount (as a number, e.g., 150.00).
              4. Generate a professional, empathetic, yet firm appeal letter citing standard coding guidelines (CPT, ICD-10) and insurance policies where applicable to overturn this denial.
              5. Extract relevant CPT codes mentioned.
              
              Return your response in JSON format:
              {
                "patient_name": "Name of the patient or 'Unknown'",
                "denial_summary": "Short explanation of why it was denied",
                "claim_amount": 0.00,
                "appeal_letter": "The full body of the appeal letter...",
                "cpt_codes": ["99213", "etc"]
              }`
                        },
                        { role: "user", content: text.substring(0, 15000) } // Limit text length
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 1000 // Limit tokens to stay within free tier/balance
                });

                const aiResponse = JSON.parse(completion.choices[0].message.content);
                analysisResult = {
                    patientName: aiResponse.patient_name,
                    denialReason: aiResponse.denial_summary,
                    appealLetter: aiResponse.appeal_letter,
                    cptCodes: aiResponse.cpt_codes,
                    claimAmount: aiResponse.claim_amount
                };
            } catch (aiError) {
                console.error("AI Error:", aiError);
                analysisResult.denialReason = "Error connecting to AI service.";
            }
        } else {
            console.log("Skipping AI analysis: No valid OPENAI_API_KEY or OPENROUTER_API_KEY found.");
            analysisResult.patientName = "John Doe (Simulated)";
            analysisResult.denialReason = "Simulation: Denial based on medical necessity (Demo Mode).";
            analysisResult.appealLetter = "Simulation: To Whom It May Concern, this is a simulated appeal letter because no API key was provided. Please check the logs.";
        }

        // Save to Database
        let appealId = null;
        try {
            const db = require('../db');
            const result = await db.query(
                `INSERT INTO appeals (patient_name, denial_reason, appeal_letter, cpt_codes, original_file_name, claim_amount) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [
                    analysisResult.patientName || 'Unknown',
                    analysisResult.denialReason,
                    analysisResult.appealLetter,
                    JSON.stringify(analysisResult.cptCodes || []),
                    req.file.originalname,
                    analysisResult.claimAmount || 0.00
                ]
            );
            appealId = result.rows[0].id;
            console.log("Saved appeal to database, ID:", appealId);
        } catch (dbError) {
            console.error("Database Save Error:", dbError.message);
            // We continue even if DB save fails to return the result to frontend
        }

        res.json({
            success: true,
            originalName: req.file.originalname,
            preview: text.substring(0, 200) + '...',
            rawText: text,
            analysis: analysisResult,
            appealId: appealId
        });

        // Cleanup: remove the temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

    } catch (error) {
        console.error('Error processing PDF:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process file: ' + error.message });
    }
});

module.exports = router;
