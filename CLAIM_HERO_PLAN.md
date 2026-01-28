# ClaimHero: Medical Claim Denial & Appeal AI

## 1. Executive Summary
**ClaimHero** is a SaaS application designed to help healthcare providers and small practices recover revenue from denied insurance claims. It uses Optical Character Recognition (OCR) and Artificial Intelligence (LLM) to analyze denial letters and automatically generate professional, citation-backed appeal letters.

---

## 2. Technology Stack

### Frontend (User Interface)
- **Framework:** React (Vite)
- **Language:** JavaScript
- **Styling:** Vanilla CSS (CSS Variables for theming, Flexbox/Grid for layout)
- **State Management:** React Context API
- **HTTP Client:** Fetch API

### Backend (API & Logic)
- **Runtime:** Node.js
- **Framework:** Express.js
- **File Handling:** Multer (for PDF uploads)
- **PDF Processing:** `pdf-parse` (Text extraction)
- **AI Integration:** OpenAI API / Google Gemini API (Appeal generation)

### Database (Data Persistence)
- **Database:** PostgreSQL
- **ORM/Query Builder:** `pg` (node-postgres) or Supabase Client
- **Storage:** File system or Object Storage (for keeping the original PDFs)

---

## 3. System Architecture

```
[User Browser]  <-->  [React Frontend]
                          |
                          | (REST API / JSON)
                          v
                  [Node.js Express Server]
                    /           \
                   /             \
        (1. Upload & Parse)    (2. Generate Appeal)
                 /                 \
       [OCR / PDF Parser]       [AI LLM API]
                 |
      (3. Store Metadata)
                 |
            [PostgreSQL DB]

---

## 4. Database Schema (PostgreSQL)

We will need a relational schema to track users and their claim history.

### Table: `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| email | VARCHAR | User login |
| practice_name | VARCHAR | Name of the medical practice |
| created_at | TIMESTAMP | Account creation date |

### Table: `claims`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key to `users` |
| patient_ref | VARCHAR | Anonymized Reference ID |
| denial_reason | TEXT | Extracted text from the PDF |
| status | VARCHAR | 'pending', 'generated', 'sent' |
| original_filename| VARCHAR | Name of the uploaded PDF |
| created_at | TIMESTAMP | |

### Table: `appeals`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| claim_id | UUID | Foreign Key to `claims` |
| content | TEXT | The AI-generated appeal letter |
| version | INT | For multiple drafts (v1, v2) |
| created_at | TIMESTAMP | |

---

## 5. Development Roadmap

### Phase 1: Foundation Setup
- Initialize Monorepo (`/client` and `/server`).
- Set up Node.js Express server.
- Set up React Vite project.
- specific CSS Design System (Variables for colors, spacing).

### Phase 2: Core Logic (The "Brain")
- Create API route `/analyze-claim`.
- Implement `pdf-parse` to read uploaded PDFs.
- Connect to AI API to generate text based on the parsed PDF.

### Phase 3: Database Integration
- Set up PostgreSQL connection.
- Create migrations for `claims` and `appeals`.
- Save generated letters to the DB.

### Phase 4: Frontend "Wow" Factor
- Build the "Drag & Drop" Upload Zone.
- Create a "Streaming Typewriter" effect for the generated letter.
- Dashboard view to see past history.

---

## 6. Key Features
1.  **Smart Parsing:** Automatically extracts the "Reason Code" (e.g., CO-15) from a messy PDF.
2.  **Medical Knowledge:** The AI is prompted with real CPT codes and medical guidelines.
3.  **One-Click Copy:** Formatted specifically for professional letterheads.
