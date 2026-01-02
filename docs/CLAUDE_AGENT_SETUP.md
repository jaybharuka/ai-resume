# Claude Agent Integration - Setup Guide

## Overview
The Claude Agent is an in-app AI assistant (similar to Cursor or Notion AI) that generates professional LaTeX resumes directly in the Monaco editor. It's legally compliant, production-ready, and uses the official Anthropic Claude API.

## ✨ Features
- **In-app modal overlay** - Professional AI assistant UI
- **Auto-injection** - Resume text + Job Description automatically loaded
- **Claude Opus powered** - Uses `claude-3-5-sonnet-20241022` for optimal LaTeX generation
- **Direct editor integration** - Generated code auto-inserts into Monaco editor
- **Editable prompts** - Power users can customize the system prompt
- **Collapsible previews** - Review resume text and JD before generation

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install @anthropic-ai/sdk
```

### 2. Get Claude API Key
1. Visit: https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key

### 3. Configure Environment
Create or update `.env.local` in the project root:

```env
# Claude API Key (required for Claude Agent)
CLAUDE_API_KEY="sk-ant-api03-..."
```

⚠️ **Important:** Never commit `.env.local` to version control!

### 4. Restart Dev Server
```bash
npm run dev
```

## 🎯 How to Use

### Step 1: Upload Resume
1. Open LaTeX Workspace
2. Click "Upload New" button
3. Select your PDF or DOCX resume
4. Wait for text extraction

### Step 2: Open Claude Agent
1. In the right sidebar under "AI Enhancements"
2. Click the purple **"Claude Agent"** button
3. The modal will appear with pre-loaded content

### Step 3: Review & Generate
1. **System Prompt** - Pre-configured for optimal LaTeX generation (editable)
2. **Resume Text** - Expand to verify extracted content
3. **Job Description** - Expand if you've entered a JD
4. Click **"Generate LaTeX Code"**

### Step 4: Compile & Preview
- Generated LaTeX automatically inserts into editor
- Automatically compiles to PDF
- Preview appears in center panel

## 🛠️ Architecture

### Components
- **`ClaudeAgentModal.tsx`** - Modal UI component
- **`app/api/claude-latex/route.ts`** - Claude API endpoint
- **`app/latex/page.tsx`** - Main workspace integration

### API Flow
```
User clicks Generate
    ↓
Modal sends: { prompt, resumeText, jdText }
    ↓
Backend calls Claude API
    ↓
Claude generates LaTeX code
    ↓
Response cleaned (remove markdown)
    ↓
Monaco editor.setValue(latex)
    ↓
Auto-compile to PDF
```

### System Prompt
The default prompt is optimized for:
- **ATS-friendly formatting**
- **Single-page layout**
- **Tectonic compatibility**
- **Professional structure**
- **Escaped special characters**
- **No custom packages**

## 📊 Model Information
- **Model:** `claude-3-5-sonnet-20241022`
- **Max Tokens:** 4096
- **Temperature:** 0.7
- **Output:** Pure LaTeX code (no markdown wrappers)

## 💡 Advanced Usage

### Custom Prompts
Click into the "System Prompt" textarea to modify:
- Add custom sections (e.g., "Publications")
- Change formatting style
- Adjust tone/language
- Add specific requirements

### Token Usage
Each generation consumes approximately:
- **Input:** ~500-2000 tokens (depends on resume length)
- **Output:** ~1000-3000 tokens (full LaTeX document)
- **Cost:** ~$0.01-0.05 per generation (Claude Sonnet pricing)

### Error Handling
The system handles:
- Missing resume text (button disabled)
- Empty responses
- API errors (network/auth)
- Malformed LaTeX (compilation logs)

## 🔒 Security & Best Practices

### API Key Security
✅ **DO:**
- Store in `.env.local`
- Add to `.gitignore`
- Rotate keys periodically
- Use environment-specific keys

❌ **DON'T:**
- Hardcode in source files
- Commit to repositories
- Share publicly
- Use in client-side code

### Rate Limiting
Claude API has rate limits:
- **Tier 1:** 50 requests/minute
- **Tier 2:** 1000 requests/minute
- Monitor usage in Anthropic Console

## 🎨 UI/UX Features
- **Dark theme** - Matches workspace aesthetic
- **Gradient accents** - Purple/pink branding
- **Collapsible sections** - Clean, organized layout
- **Loading states** - Spinner during generation
- **Disabled states** - Prevents duplicate requests
- **Error feedback** - Alert dialogs for failures

## 🐛 Troubleshooting

### Issue: "Failed to generate LaTeX"
**Cause:** Invalid/missing API key
**Fix:** 
1. Check `.env.local` exists
2. Verify `CLAUDE_API_KEY` is set
3. Restart dev server

### Issue: Modal doesn't open
**Cause:** No resume uploaded
**Fix:** Upload a resume first (button will be enabled)

### Issue: Generated LaTeX won't compile
**Cause:** Claude output contains unsupported packages
**Fix:** 
1. Check compilation logs
2. Edit prompt to restrict packages
3. Regenerate

### Issue: Empty/truncated output
**Cause:** Token limit exceeded
**Fix:**
1. Reduce resume length
2. Simplify JD text
3. Increase max_tokens in API route

## 📈 Future Enhancements
- [ ] Streaming responses (real-time generation)
- [ ] Multi-turn conversations (iterative refinement)
- [ ] Template library integration
- [ ] Export/save favorite prompts
- [ ] Usage analytics dashboard

## 📚 References
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Pricing](https://www.anthropic.com/pricing)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)

## 🤝 Support
For issues or questions:
1. Check troubleshooting section
2. Review Anthropic API logs
3. Inspect browser console
4. Check network tab for API calls

---

**Legal Compliance:** This integration uses the official Anthropic API and complies with their Terms of Service. It does NOT scrape Claude.ai website or violate usage policies.
