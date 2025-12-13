# ATS Score, Job Description Analysis, and Suggestions

This document explains how the repository analyzes job descriptions (JDs), generates suggestions to tailor a resume, and computes the ATS (Applicant Tracking System) score. It covers the processing pipeline, algorithms, API endpoints, UI components, examples, testing steps, and extension points.

**Note:** When I refer to files or components in this repo, they are wrapped in backticks (e.g., `components/ATSScoreCard.tsx`).

---

## Overview

- Purpose: Help candidates tailor resumes to job descriptions by extracting requirements from a JD, matching them to the candidate's resume, generating actionable suggestions, and computing an ATS compatibility score (0–100).
- Key outputs:
  - Structured JD features (skills, tools, qualifications, seniority, responsibilities).
  - A ranked list of suggestions (skills to add, keywords to emphasize, formatting fixes, experience phrasing).
  - An ATS score reflecting how well the resume matches the JD.

---

## Inputs

- Job Description (JD): raw text (copy-paste) or PDF uploaded and parsed. The repo exposes endpoints that accept JD text and/or a parsed resume payload.
- Resume: parsed JSON representing sections (experience, education, skills) and plain-text fallback.

---

## High-Level Pipeline

1. Ingest & Normalize
   - Convert PDF -> text if needed (server-side PDF parsing flow). Clean whitespace, remove boilerplate.
   - Normalize text (lowercasing for matching while keeping originals for suggested rewrites).

2. JD Parsing & Feature Extraction
   - Tokenization & sentence-splitting.
   - Named-Entity / Keyword extraction for: skills, technologies, certifications, tools, years, seniority terms ("senior", "lead"), and domain nouns.
   - Techniques used: rule-based regex for versions and common tech tokens, plus ML/NLP models for contextual phrases (embedding-based similarity).

3. Semantic Representation
   - Build dense embeddings for JD chunks and candidate resume content (models or vectorizers configured in the app).
   - Generate TF-IDF or embedding-based vectors for skill/requirement clusters.

4. Skill & Requirement Matching
   - Exact token match (normalized) for required keywords.
   - Fuzzy match using embeddings (cosine similarity) for synonyms or near matches (e.g., "Postgres" ~ "PostgreSQL").
   - Map synonyms, canonicalize names via a `skills` dictionary.

5. Suggestion Generation
   - Missing skills: skills present in the JD but not in the resume (or present but below threshold) produce direct suggestions to add/expand.
   - Strengthen phrasing: propose action-oriented bullet rephrases pulled from resume sentences and rewritten to include JD keywords.
   - Formatting hints: if the resume has problematic formats (images, tables), suggest simpler structures for better ATS parsing.
   - Prioritization: suggestions are scored by impact (how many JD occurrences they fix) and feasibility (easy copy/paste vs. rewrite).

6. ATS Scoring
   - Basic components of the score:
     - Keyword Coverage (weighted): portion of JD-required keywords found in resume.
     - Skill Match Strength: embedding-similarity weighted averages for important skill clusters.
     - Experience Relevance: overlap between job responsibilities and resume experience (semantic similarity).
     - Formatting / Parsability Penalty: deduct points for resume elements that commonly break ATS parsing.
     - Frequency & Placement bonus: keywords appearing in title/experience result in slightly higher weight.
   - Scoring approach: compute component sub-scores (0–1), weight them, sum, then normalize to 0–100.
   - Thresholds & weights can be tuned in config (e.g., `atsConfig`), and documented in the next section.

---

## Scoring Example (illustrative)

- Keyword Coverage: 0.70 (70% of required keywords matched)
- Skill Match Strength: 0.65
- Experience Relevance: 0.60
- Formatting Penalty: -0.05 (5% deduction)

Weighted sum (example weights):
- 40% Keyword Coverage -> 0.28
- 30% Skill Strength -> 0.195
- 25% Experience Relevance -> 0.15
- 5% Formatting penalty -> -0.025
Total = 0.60 -> ATS score = 60/100

---

## API & File Mapping (where to look in this repo)

- Endpoint(s):
  - `app/api/analyze-ats/route.ts` — analyzes JD + resume and returns suggestions + ats score (if present in the codebase).
  - `app/api/parse-pdf/route.ts` — PDF -> text extraction pipeline used prior to analysis.
  - `app/api/extract-data/route.ts` — resume parsing and field extraction.

- UI components:
  - `components/ATSScoreCard.tsx` — displays score, progress, and quick suggestions in the UI.
  - `components/ResumePreview.tsx` or `components/ResumeEditor.tsx` — where suggested rewrites or injected keywords are previewed.

- Server-side helpers & NLP modules:
  - Check `lib/` (or `utils/`) for extractor utilities (skill canonicalization, tokenizers, embedding wrappers).
  - If present, `services/embedding.ts` or `services/nlp.ts` contains wrapper calls to model APIs.

---

## Example Request / Response

Example request (JSON sent to the ATS analysis endpoint):

```json
{
  "jobDescription": "We are hiring a Senior Node.js backend engineer with experience in PostgreSQL, Prisma, and cloud deployments.",
  "resume": {
    "text": "...full resume text...",
    "sections": {
      "experience": [ /* parsed experience items */ ],
      "skills": ["Node.js", "React"]
    }
  }
}
```

Example response:

```json
{
  "atsScore": 62,
  "components": {
    "keywordCoverage": 0.72,
    "skillMatchStrength": 0.6,
    "experienceRelevance": 0.55,
    "formattingPenalty": 0.0
  },
  "suggestions": [
    {"type":"add_skill", "text":"Add 'PostgreSQL' to Skills and show project experience using it.", "impact": 8},
    {"type":"rephrase_bullet", "text":"Reword: 'Built REST APIs' -> 'Designed and implemented REST APIs using Node.js and Express with PostgreSQL backend.'", "impact": 6}
  ]
}
```

---

## Where the decisions happen in code (implementation notes)

- Keyword extraction is often done by a mix of regexes and a skills dictionary. Look for code that:
  - Normalizes tokens (trim, lowercase, remove punctuation).
  - Uses a curated `skillMap` to canonicalize names ("postgresql" => "PostgreSQL").

- Embedding-based matching requires a model:
  - If the repo calls an external service (OpenAI/experimental models, Google, or local runner), the wrapper lives in `services/`.
  - The process: compute embeddings for JD phrases and each resume sentence; compute cosine similarity; aggregate by experience item.

- Suggestion generation:
  - Missing-skill suggestions are generated by set-difference (JD-skills minus resume-skills) and then prioritized by JD frequency.
  - Rewriting suggestions may call a rewrite model or use templated phrasing.

- ATS scoring code:
  - Look for a single `computeAtsScore` or `scoreResumeAgainstJD` function in `lib`/`services` or inside `app/api/analyze-ats/route.ts`.
  - The function should return both per-component values and the overall normalized score.

---

## Testing Locally

1. Make sure type-check passes and the app builds:

```powershell
npx tsc --noEmit
npx next build
```

2. Start dev server (example):

```powershell
npm run dev
# or
npx next dev -p 3004
```

3. Call the analyze endpoint with `curl` or Postman, or use the UI flow that triggers `analyze-ats`:

```powershell
curl -X POST http://localhost:3004/api/analyze-ats -H "Content-Type: application/json" -d @sample-request.json
```

4. UI verification: open the app and navigate to the resume analysis view. Confirm `components/ATSScoreCard.tsx` shows a score and lists suggestions.

---

## Tuning & Monitoring

- Weights & thresholds: prefer configuring weights (keyword coverage, embedding thresholds) in a central config (e.g., `config/ats.ts` or an environment variable). This allows tuning without code changes.
- Logging: log per-request component scores and suggestion counts. This can help tune weights and detect regressions.
- A/B testing: experiment with alternate rewrite templates or thresholds and evaluate conversion (users who applied vs. not).

---

## Privacy & Security

- JD and resume data are PII; ensure requests and logs do not store raw resume text in insecure logs.
- If the project uses external NLP APIs, ensure data handling conforms to your privacy policy and that you mask or redact sensitive tokens when needed.

---

## Troubleshooting

- ChunkLoadError / stale build assets: remove `.next` and rebuild if the browser complains about missing chunks.

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next
npx next build
npm run dev
```

- If scores seem off: check the skill canonicalization dictionary and embedding model configuration.

---

## Next Steps / Improvements

- Add unit tests for `computeAtsScore` with deterministic fixtures.
- Add integration tests for `app/api/analyze-ats/route.ts` that use small JD/resume examples.
- Surface confidence values per suggestion so UI can display high/low confidence items.
- Add a dashboard to monitor per-job-type score distributions.

---

## Useful Repo Pointers

- `app/api/analyze-ats/route.ts` — analysis entry point (if present).
- `components/ATSScoreCard.tsx` — UI display for the score.
- `components/ResumePreview.tsx` / `Editor` components — where suggestions are applied.
- `lib/` or `services/` — NLP helpers, embedding wrappers, canonicalization utilities.

---

If you want, I can now:
- wire this doc into the repo `README.md` or `CONTRIBUTING.md`.
- create unit tests for the scoring function.
- or run the dev server and exercise the analyze endpoint with a sample JD/resume.

Which would you like next?
