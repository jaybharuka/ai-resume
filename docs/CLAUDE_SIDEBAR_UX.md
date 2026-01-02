# Claude Agent - Sliding Sidebar UX

## 🎨 Visual Layout

### Normal State
```
┌──────────────────────────────────────────────────────────┐
│  Header: [< Back] LaTeX Workspace [Compile][Download...] │
├────────────┬─────────────────────┬──────────────────────┤
│            │                     │  Resume Tools        │
│  Monaco    │    PDF Preview      │  ┌─────────────────┐ │
│  Editor    │                     │  │ Claude Agent    │ │
│            │                     │  │ (Purple Button) │ │
│  [Code...] │  [PDF Rendering]    │  └─────────────────┘ │
│            │                     │  [Expert Overhaul]   │
│            │                     │  [Improve Summary]   │
│            │                     │  [Job Description]   │
└────────────┴─────────────────────┴──────────────────────┘
```

### Claude Agent Active (Slides In)
```
┌──────────────────────────────────────────────────────────┐
│  Header: [< Back] LaTeX Workspace [Compile][Download...] │
├────────────┬─────────────────────┬──────────────────────┤
│            │                     │ Claude Agent     [X] │
│  Monaco    │    PDF Preview      │ ┌──────────────────┐ │
│  Editor    │                     │ │ System Prompt    │ │
│            │                     │ │ [editable...]    │ │
│  [Code     │  [PDF Rendering]    │ └──────────────────┘ │
│   appears  │                     │ ▼ Resume Context     │
│   here!]   │                     │ ▼ Job Description    │
│            │                     │ [Generate LaTeX]     │
└────────────┴─────────────────────┴──────────────────────┘
              ↑ User can watch code appear in real-time!
```

## ✨ Key UX Improvements

### 1. **Slide Animation**
- Sidebar slides in from the **right** (420px width)
- Smooth `300ms` ease-out transition
- Tools panel fades out (opacity animation)

### 2. **Non-Blocking**
- Editor stays visible ✅
- Preview stays visible ✅
- User can watch code being generated in real-time

### 3. **Compact Design**
- Smaller header (reduced padding)
- Condensed font sizes (10px, 11px, 12px)
- Tighter spacing for more content

### 4. **Professional Look**
- Matches Cursor AI aesthetic
- Purple/pink gradient branding
- Dark theme consistency
- Subtle shadows and borders

## 🚀 User Flow

### Step 1: Activate
```
User clicks "Claude Agent" button in Tools panel
    ↓
Sidebar slides in from right (300ms animation)
    ↓
Tools panel fades out (opacity: 0)
```

### Step 2: Configure (Optional)
```
System Prompt: [Pre-loaded, editable]
Resume Context: [Auto-loaded from upload]
Job Description: [From JD textarea]
```

### Step 3: Generate
```
User clicks "Generate LaTeX" button
    ↓
Button shows "Generating..." with spinner
    ↓
Status box appears: "Watch your editor for real-time updates"
    ↓
API call to Claude → Response → editor.setValue()
    ↓
Code appears in Monaco editor (user can see it!)
    ↓
Auto-compile to PDF
    ↓
Sidebar stays open for iteration
```

### Step 4: Iterate or Close
```
Option A: Close sidebar (X button) → Slides out, tools return
Option B: Edit prompt → Generate again → Iterative improvement
```

## 🎯 Why This is Better

| Feature | Modal (Old) | Sidebar (New) |
|---------|-------------|---------------|
| **Editor Visibility** | ❌ Hidden | ✅ Visible |
| **Watch Generation** | ❌ No | ✅ Yes |
| **Feels Integrated** | ❌ Popup | ✅ Native panel |
| **Iteration-Friendly** | ❌ Close/reopen | ✅ Stays open |
| **Like Cursor/Copilot** | ❌ No | ✅ Yes! |

## 🔧 Technical Details

### Component: `ClaudeAgentModal.tsx`
```tsx
// Positioning
className="fixed top-0 right-0 h-full w-[420px]"

// Animation
className={`transition-transform duration-300 ease-out ${
  isOpen ? 'translate-x-0' : 'translate-x-full'
}`}

// Z-index
z-50 (above everything)
```

### Page Integration: `page.tsx`
```tsx
// Tools panel fades when Claude is active
className={`transition-opacity duration-300 ${
  claudeModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
}`}

// Claude sidebar renders at same position
<ClaudeAgentModal 
  isOpen={claudeModalOpen}
  onClose={() => setClaudeModalOpen(false)}
  // ... props
/>
```

### Width Calculation
```
Normal layout:
- Editor: 40% (~600px on 1920px screen)
- Preview: 1fr (~1040px)
- Tools: 280px

Claude active:
- Editor: 40% (~600px) ← Still visible!
- Preview: 1fr (~1040px) ← Still visible!
- Claude: 420px (slides over tools)
```

## 🎨 Styling Highlights

### Purple/Pink Gradient
```css
bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500
shadow-lg shadow-purple-900/30
```

### Compact Typography
```css
Header: text-base (16px)
Labels: text-xs (12px)
Descriptions: text-[10px] (10px)
Code: text-[11px] (11px, monospace)
```

### Smooth Transitions
```css
transition-transform duration-300 ease-out  // Slide
transition-opacity duration-300             // Fade
transition-colors                           // Hover states
```

## 📱 Responsive Behavior

### Desktop (>1024px)
- Sidebar: 420px wide
- No backdrop (transparent)
- Slides over tools panel

### Mobile (<1024px)
- Sidebar: Full width
- Dark backdrop with blur
- Click backdrop to close

## 🔮 Future Enhancements

- [ ] **Streaming responses** - Show code being typed character-by-character
- [ ] **Chat history** - Multi-turn conversations with Claude
- [ ] **Diff view** - Show what changed in the code
- [ ] **Version history** - Undo/redo generations
- [ ] **Resize handle** - Drag to adjust sidebar width
- [ ] **Split view** - Show old vs new code side-by-side

## 🎬 Animation Timing

```
Slide In:  300ms ease-out (smooth entry)
Slide Out: 300ms ease-out (smooth exit)
Fade:      300ms linear (tools panel)
Hover:     150ms (button states)
```

---

**Result:** A professional, Cursor-style AI assistant that feels native to your app! 🚀
