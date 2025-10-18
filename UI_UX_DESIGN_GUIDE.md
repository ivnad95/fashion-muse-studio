# Fashion Muse Studio - UI/UX Design Guide

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Identity](#visual-identity)
3. [Design System](#design-system)
4. [Component Library](#component-library)
5. [Page Layouts](#page-layouts)
6. [User Flows](#user-flows)
7. [Interactions & Animations](#interactions--animations)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Design Patterns](#design-patterns)

---

## 1. Design Philosophy

### **Core Principles**

#### **Minimalism**
The interface embraces minimalist design principles, removing unnecessary elements to focus user attention on the core functionality: AI-powered fashion photography generation.

**Key Characteristics:**
- Clean, uncluttered layouts
- Generous white space (or dark space in this case)
- Limited color palette
- Clear visual hierarchy
- Purpose-driven design elements

#### **Glassmorphism**
The primary visual style is glassmorphism - a modern design trend featuring translucent, frosted-glass-like surfaces.

**Visual Properties:**
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders with transparency
- Layered depth with shadows
- Light reflections and highlights

#### **Premium & Professional**
The design conveys a sense of premium quality and professional capability, appropriate for a fashion photography tool.

**Design Choices:**
- Sophisticated color palette (deep navy + bright blue)
- High-quality typography
- Smooth animations and transitions
- Attention to micro-interactions
- Polished, refined aesthetic

#### **User-Centric**
Every design decision prioritizes user experience and ease of use.

**UX Principles:**
- Intuitive navigation
- Clear feedback for all actions
- Progressive disclosure of complexity
- Consistent interaction patterns
- Mobile-first responsive design

---

## 2. Visual Identity

### **Brand Colors**

#### **Primary Palette**

```css
Deep Navy (Background)
#0A133B
RGB: 10, 19, 59
Usage: Main background, dark surfaces
Psychology: Trust, professionalism, depth

Rich Blue (Secondary Background)
#002857
RGB: 0, 40, 87
Usage: Gradient backgrounds, hover states
Psychology: Stability, confidence

Bright Blue (Accent)
#0A76AF
RGB: 10, 118, 175
Usage: Primary actions, highlights, links
Psychology: Energy, creativity, innovation

Dark Blue (Accent Secondary)
#004b93
RGB: 0, 75, 147
Usage: Button gradients, active states
Psychology: Reliability, strength
```

#### **Neutral Palette**

```css
Off-White (Primary Text)
#F5F7FA
RGB: 245, 247, 250
Usage: Headings, primary content
Contrast Ratio: 14.2:1 (AAA)

Light Gray (Secondary Text)
#C8CDD5
RGB: 200, 205, 213
Usage: Descriptions, labels
Contrast Ratio: 8.5:1 (AAA)

Muted Gray (Tertiary Text)
#8A92A0
RGB: 138, 146, 160
Usage: Hints, placeholders, disabled states
Contrast Ratio: 4.8:1 (AA)
```

#### **Semantic Colors**

```css
Success Green
#10B981
RGB: 16, 185, 129
Usage: Success messages, completed states

Warning Amber
#F59E0B
RGB: 245, 158, 11
Usage: Warnings, pending states

Error Red
#EF4444
RGB: 239, 68, 68
Usage: Errors, destructive actions

Info Blue
#3B82F6
RGB: 59, 130, 246
Usage: Information, tips
```

### **Typography**

#### **Font Stack**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

**Rationale**: System font stack ensures:
- Native look and feel on each platform
- Optimal performance (no font loading)
- Excellent readability
- Consistent rendering

#### **Type Scale**

| Size | Rem | Pixels | Usage |
|------|-----|--------|-------|
| xs | 0.75rem | 12px | Small labels, captions |
| sm | 0.875rem | 14px | Body text, descriptions |
| base | 1rem | 16px | Default body text |
| lg | 1.125rem | 18px | Emphasized text |
| xl | 1.25rem | 20px | Small headings |
| 2xl | 1.5rem | 24px | Section headings |
| 3xl | 1.875rem | 30px | Page headings |
| 4xl | 2.25rem | 36px | Hero headings |

#### **Font Weights**

```css
Regular: 400    /* Body text, descriptions */
Medium: 500     /* Emphasized text, labels */
Semibold: 600   /* Subheadings, buttons */
Bold: 700       /* Headings, important text */
```

#### **Line Heights**

```css
Tight: 1.25     /* Large headings */
Normal: 1.5     /* Body text */
Relaxed: 1.75   /* Long-form content */
Loose: 2        /* Spacious layouts */
```

### **Logo & Branding**

#### **Primary Logo**
- **File**: `pmlogo1(1).png`
- **Format**: PNG with transparency
- **Usage**: Navigation header, watermarks
- **Minimum Size**: 32px height
- **Clear Space**: 16px on all sides

#### **Logo Variations**
- **Full Color**: Primary logo on dark backgrounds
- **Watermark**: Semi-transparent overlay on generated images
- **Favicon**: Simplified icon version (future)

---

## 3. Design System

### **Glassmorphism Components**

#### **Glass Surface**

**Visual Properties:**
```css
.glass-3d-surface {
  /* Semi-transparent background */
  background: rgba(255, 255, 255, 0.05);
  
  /* Frosted glass blur effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Subtle border with transparency */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Layered shadows for depth */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),           /* Outer shadow */
    inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Inner highlight */
  
  /* Smooth rounded corners */
  border-radius: 24px;
}
```

**Usage:**
- Cards and containers
- Modal dialogs
- Dropdown menus
- Navigation bars
- Content panels

#### **Glass Button**

**Visual Properties:**
```css
.glass-3d-button {
  /* Gradient background for depth */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  
  /* Prominent border */
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* 3D shadow effect */
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  /* Smooth transitions */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover State */
.glass-3d-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Active State */
.glass-3d-button:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

**Button Variants:**

1. **Primary Button**
```css
.primary-button {
  background: linear-gradient(135deg, #0A76AF, #004b93);
  color: #F5F7FA;
  font-weight: 600;
}
```

2. **Secondary Button**
```css
.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: #C8CDD5;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

3. **Danger Button**
```css
.danger-button {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: #F5F7FA;
}
```

#### **Glass Input**

**Visual Properties:**
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  color: #F5F7FA;
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* Focus State */
.glass-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #0A76AF;
  box-shadow: 
    0 0 0 3px rgba(10, 118, 175, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.2);
  outline: none;
}

/* Placeholder */
.glass-input::placeholder {
  color: #8A92A0;
}
```

### **Spacing System**

**Scale**: Based on 4px increments

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

**Usage Guidelines:**
- **4px (space-1)**: Tight spacing, icon gaps
- **8px (space-2)**: Small gaps, button padding
- **12px (space-3)**: Default gaps between related elements
- **16px (space-4)**: Standard padding, gaps between sections
- **24px (space-6)**: Large padding, card spacing
- **32px (space-8)**: Section spacing
- **48px+ (space-12+)**: Major layout spacing

### **Border Radius**

```css
--radius-sm: 8px;     /* Small elements, badges */
--radius-md: 12px;    /* Buttons, inputs */
--radius-lg: 16px;    /* Cards, small containers */
--radius-xl: 24px;    /* Large cards, modals */
--radius-2xl: 32px;   /* Hero sections */
--radius-full: 9999px; /* Pills, circular elements */
```

### **Shadows**

```css
/* Elevation Levels */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.4);

/* Glass Shadows (with inner highlight) */
--glass-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

---

## 4. Component Library

### **Navigation**

#### **Top Navigation Bar**

**Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Logo]              [Home] [History] [Settings]   │
└────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 64px
- Background: `glass-3d-surface`
- Position: Fixed top
- Z-index: 50
- Padding: 16px 24px

**Navigation Items:**
- Font size: 14px
- Font weight: 500
- Color: #C8CDD5 (inactive), #F5F7FA (active)
- Hover: Slight scale (1.05), color change
- Active indicator: Bottom border (2px, #0A76AF)

#### **Logo**
- Height: 32px
- Clickable (returns to home)
- Hover: Slight scale (1.05)

### **Cards**

#### **Standard Card**

**Visual:**
```
┌─────────────────────────────────┐
│  [Icon/Image]                   │
│                                 │
│  Heading                        │
│  Description text here...       │
│                                 │
│  [Action Button]                │
└─────────────────────────────────┘
```

**Specifications:**
- Background: `glass-3d-surface`
- Padding: 24px
- Border radius: 24px
- Hover: translateY(-4px), enhanced shadow

#### **Image Card (Results/History)**

**Visual:**
```
┌─────────────────────────────────┐
│                                 │
│        [Image Preview]          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Download] [Share] [Del]│   │ (Hover overlay)
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Specifications:**
- Aspect ratio: Maintained from original
- Border radius: 16px
- Overlay: Gradient from transparent to rgba(0,0,0,0.6)
- Actions: Appear on hover (desktop) or always visible (mobile)

### **Buttons**

#### **Size Variants**

```css
/* Small */
.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
  border-radius: 12px;
}

/* Medium (Default) */
.btn-md {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 16px;
}

/* Large */
.btn-lg {
  padding: 16px 32px;
  font-size: 1.125rem;
  border-radius: 20px;
}
```

#### **Icon Buttons**

**Circular Icon Button:**
```css
.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Usage:**
- Delete, favorite, share actions
- Navigation controls
- Close buttons

### **Forms**

#### **Text Input**

**Structure:**
```
Label (optional)
┌─────────────────────────────────┐
│ Placeholder text...             │
└─────────────────────────────────┘
Helper text (optional)
```

**States:**
- **Default**: Light border, subtle background
- **Focus**: Bright border, enhanced background, shadow
- **Error**: Red border, error message below
- **Disabled**: Reduced opacity, no interaction

#### **Select/Dropdown**

**Closed State:**
```
┌─────────────────────────────────┐
│ Selected option            [▼]  │
└─────────────────────────────────┘
```

**Open State:**
```
┌─────────────────────────────────┐
│ Selected option            [▲]  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Option 1                        │
│ Option 2                   [✓]  │
│ Option 3                        │
└─────────────────────────────────┘
```

**Specifications:**
- Dropdown: `glass-3d-surface` with enhanced shadow
- Max height: 300px (scrollable)
- Options: Hover background change
- Selected: Checkmark icon

#### **File Upload**

**Visual:**
```
┌─────────────────────────────────┐
│                                 │
│         [Upload Icon]           │
│                                 │
│    Click to upload or drag      │
│         and drop here           │
│                                 │
│      PNG, JPG up to 10MB        │
│                                 │
└─────────────────────────────────┘
```

**States:**
- **Default**: Dashed border, centered content
- **Hover**: Solid border, slight background change
- **Drag Over**: Bright border, enhanced background
- **Uploaded**: Preview image, change/remove options

### **Image Count Selector**

**Visual:**
```
┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐
│ 1 │  │ 2 │  │ 4 │  │ 6 │  │ 8 │
└───┘  └───┘  └───┘  └───┘  └───┘
```

**Specifications:**
- Shape: Circular buttons
- Size: 48px diameter
- Active: Bright blue gradient background
- Inactive: Glass surface with border
- Hover: Scale (1.1), enhanced shadow
- Transition: All properties 0.3s ease

### **Loading States**

#### **Shimmer Placeholder**

**Visual:**
```
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░ │ (Animated)
│                                 │
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────┘
```

**Animation:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

#### **Progress Bar**

**Visual:**
```
┌─────────────────────────────────┐
│ ████████████░░░░░░░░░░░░░░░░░░ │ 60%
└─────────────────────────────────┘
```

**Specifications:**
- Height: 4px
- Background: rgba(255, 255, 255, 0.1)
- Fill: Linear gradient (#0A76AF to #004b93)
- Animation: Smooth transition
- Optional: Percentage label

#### **Spinner**

**Visual:**
```
    ◐
  ◐   ◑
◐       ◑
  ◑   ◑
    ◑
```

**Specifications:**
- Size: 24px (small), 40px (medium), 64px (large)
- Color: #0A76AF
- Animation: Rotate 360deg, 1s linear infinite
- Usage: Button loading, page loading

### **Modals**

#### **Image Zoom Modal**

**Structure:**
```
┌─────────────────────────────────────────────┐
│                                      [✕]    │
│                                             │
│                                             │
│              [Large Image]                  │
│                                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Download]  [Share]  [Delete]       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Specifications:**
- Backdrop: rgba(0, 0, 0, 0.8) with blur
- Modal: `glass-3d-surface` with max-width 90vw
- Image: Max-height 80vh, object-fit contain
- Close button: Top-right, icon button
- Actions: Bottom bar, glass surface
- Animation: Fade in + scale from 0.95 to 1

### **Toast Notifications**

**Visual:**
```
┌─────────────────────────────────┐
│ [✓] Success message here!       │
└─────────────────────────────────┘
```

**Variants:**
- **Success**: Green accent, checkmark icon
- **Error**: Red accent, X icon
- **Warning**: Amber accent, warning icon
- **Info**: Blue accent, info icon

**Specifications:**
- Position: Top-right
- Width: 360px max
- Background: `glass-3d-surface`
- Duration: 3-5 seconds
- Animation: Slide in from right, fade out
- Stacking: Multiple toasts stack vertically

---

## 5. Page Layouts

### **Home Page (Generation Interface)**

#### **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│ Navigation Bar                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Good morning, User                        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Image Count Selector                      │ │
│  │ [1] [2] [4] [6] [8]                       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │         [Upload Area]                     │ │
│  │         [Logo]                            │ │
│  │   Click to upload or drag and drop       │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ▼ Advanced Options                        │ │
│  │   Style: [Editorial ▼]                    │ │
│  │   Camera Angle: [Hero low angle ▼]       │ │
│  │   Lighting: [Rembrandt ▼]                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         [Generate Button]                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **Component Breakdown**

**1. Greeting Card**
- Background: `glass-3d-surface`
- Padding: 24px
- Font size: 24px (heading)
- Dynamic greeting: "Good morning/afternoon/evening"
- User name: First name from account

**2. Image Count Selector**
- Layout: Horizontal flex, center aligned
- Spacing: 12px gap
- Buttons: Circular, 48px diameter
- Active state: Bright blue gradient
- Label: "How many images?"

**3. Upload Area**
- Height: 400px (desktop), 300px (mobile)
- Border: 2px dashed rgba(255, 255, 255, 0.2)
- Hover: Solid border, enhanced background
- Logo: Centered, 80px height
- Text: Centered, multi-line instructions
- File types: PNG, JPG, JPEG
- Max size: 10MB

**4. Advanced Options (Collapsible)**
- Default: Collapsed
- Toggle: Chevron icon rotates
- Animation: Smooth height transition
- Dropdowns: Full-width, glass style
- Options:
  - **Style**: Editorial, Street, Studio, Vintage, etc.
  - **Camera Angle**: Hero low angle, Eye level, High angle, etc.
  - **Lighting**: Rembrandt, Butterfly, Split, Natural, etc.

**5. Generate Button**
- Width: Full width
- Height: 56px
- Background: Bright blue gradient
- Text: "Generate" or "Generating..." with spinner
- Disabled: When no image or insufficient credits
- Hover: Enhanced shadow, slight lift

### **Results Page**

#### **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│ Navigation Bar                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [✓] Results (4 images)                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │                 │  │                 │     │
│  │   Image 1       │  │   Image 2       │     │
│  │                 │  │                 │     │
│  │ [Actions]       │  │ [Actions]       │     │
│  └─────────────────┘  └─────────────────┘     │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │                 │  │                 │     │
│  │   Image 3       │  │   Image 4       │     │
│  │                 │  │                 │     │
│  │ [Actions]       │  │ [Actions]       │     │
│  └─────────────────┘  └─────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **States**

**1. Loading State**
```
┌─────────────────────────────────────────────────┐
│ ⚡ Generating... (4 images)                     │
│ [Progress Bar: 50%]                             │
├─────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │   ▓▓▓▓▓▓▓░░░░   │  │   ▓▓▓▓▓▓▓░░░░   │     │
│  │   Shimmer       │  │   Shimmer       │     │
│  │   Processing    │  │   Processing    │     │
│  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

**2. Completed State**
```
┌─────────────────────────────────────────────────┐
│ [✓] Results (4 images)                          │
├─────────────────────────────────────────────────┤
│  Grid of generated images with actions          │
│  (Images fade in with staggered animation)      │
└─────────────────────────────────────────────────┘
```

**3. Empty State**
```
┌─────────────────────────────────────────────────┐
│            [Sparkle Icon]                       │
│                                                 │
│        No results yet                           │
│   Generate your first fashion shoot!            │
│                                                 │
│        [Go to Home]                             │
└─────────────────────────────────────────────────┘
```

#### **Image Grid**
- Columns: 2 (desktop), 1 (mobile)
- Gap: 24px
- Image aspect ratio: Maintained from generation
- Border radius: 16px
- Hover: Scale (1.02), enhanced shadow

#### **Image Actions (Hover Overlay)**
- Background: Linear gradient (transparent to rgba(0,0,0,0.6))
- Position: Bottom of image
- Buttons: Icon + text, horizontal layout
- Actions:
  - **Download**: Download icon, saves image
  - **Share**: Share icon, native share or copy link
  - **Delete**: Trash icon, shows confirmation

#### **Watermark (Free Users)**
- Position: Bottom-right corner
- Logo: Semi-transparent (30% opacity)
- Text: "FASHION MUSE Studio" below logo
- Size: 80px width
- Not removable for free users

### **History Page**

#### **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│ Navigation Bar                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 📸 Generation History                     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ October 18, 2025                          │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │ │
│  │ │ Img │ │ Img │ │ Img │ │ Img │          │ │
│  │ └─────┘ └─────┘ └─────┘ └─────┘          │ │
│  │ 4 images • Editorial style                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ October 17, 2025                          │ │
│  │ ┌─────┐ ┌─────┐                           │ │
│  │ │ Img │ │ Img │                           │ │
│  │ └─────┘ └─────┘                           │ │
│  │ 2 images • Street style                   │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **Generation Card**
- Background: `glass-3d-surface`
- Padding: 20px
- Border radius: 20px
- Hover: Enhanced shadow

**Header:**
- Date: Large, bold
- Time: Small, muted

**Thumbnail Grid:**
- Size: 80px × 80px
- Gap: 8px
- Max visible: 4 (show "+N more" if more)
- Click: Opens zoom modal

**Metadata:**
- Image count
- Style used
- Status indicator (if processing/failed)

**Actions:**
- View all: Opens expanded view
- Delete: Confirmation modal

### **Settings Page**

#### **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│ Navigation Bar                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ⚙️ Settings                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Profile                                │ │
│  │ ┌─────────────────────────────────────┐   │ │
│  │ │ [Avatar] John Doe                   │   │ │
│  │ │          john@example.com           │   │ │
│  │ │          Member since Oct 2025      │   │ │
│  │ └─────────────────────────────────────┘   │ │
│  │ [Logout]                                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 💳 Credits                                │ │
│  │ ┌─────────────────────────────────────┐   │ │
│  │ │ Available Credits: 25               │   │ │
│  │ └─────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ▼ Buy Credits                             │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐      │ │
│  │ │ Starter │ │ Popular │ │   Pro   │      │ │
│  │ │ 25      │ │ 100     │ │  250    │      │ │
│  │ │ £4.99   │ │ £14.99  │ │ £29.99  │      │ │
│  │ │ [Buy]   │ │ [Buy]   │ │ [Buy]   │      │ │
│  │ └─────────┘ └─────────┘ └─────────┘      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **Profile Section**
- Avatar: Circular, 64px, gradient background with initials
- Name: Large, bold
- Email: Medium, muted
- Member since: Small, muted
- Logout button: Secondary style, full width

#### **Credits Section**
- Large credit count display
- Icon: Coin or credit card
- Color: Bright blue accent

#### **Credit Packages (Collapsible)**
- Grid: 3 columns (desktop), 1 column (mobile)
- Gap: 16px

**Package Card:**
- Background: `glass-3d-surface`
- Padding: 20px
- Border radius: 16px
- Hover: Lift effect

**Popular Badge:**
- Position: Top-right corner
- Background: Bright blue gradient
- Text: "POPULAR"
- Font: Small, bold, uppercase

**Best Value Badge:**
- Position: Top-right corner
- Background: Green gradient
- Text: "BEST VALUE"

**Content:**
- Package name: Bold, large
- Credit count: Very large, accent color
- Price: Large, bold
- Buy button: Primary style, full width

---

## 6. User Flows

### **First-Time User Journey**

```
1. LANDING
   User visits app URL
   ↓
2. SIGN IN PROMPT
   Sees: "Welcome to Fashion Muse Studio"
   Action: Click "Sign In with Manus"
   ↓
3. OAUTH FLOW
   Redirected to Manus OAuth
   Signs in with Google
   ↓
4. RETURN TO APP
   Authenticated, redirected to Home
   Sees: Greeting with name
   Credits: 10 (free)
   ↓
5. FIRST GENERATION
   Uploads photo
   Selects 2 images
   Clicks "Generate"
   ↓
6. RESULTS PAGE
   Sees loading placeholders
   Page auto-refreshes
   Images appear (fade in)
   ↓
7. INTERACTION
   Clicks image → Zoom modal
   Downloads image
   Shares on social media
   ↓
8. CREDIT DEPLETION
   After 5 generations (10 credits used)
   Sees: "Insufficient credits" error
   ↓
9. PURCHASE CREDITS
   Goes to Settings
   Expands "Buy Credits"
   Selects package
   Completes Stripe checkout
   ↓
10. CONTINUED USE
    Credits added
    Continues generating
    Checks History
```

### **Generation Flow (Detailed)**

```
┌─────────────────────────────────────────────┐
│ HOME PAGE                                   │
│                                             │
│ 1. User uploads image                       │
│    • Click upload area OR drag & drop       │
│    • File validation (type, size)           │
│    • Preview shown                          │
│                                             │
│ 2. User selects image count                 │
│    • Clicks number (1, 2, 4, 6, or 8)       │
│    • Button highlights                      │
│    • Credit cost calculated                 │
│                                             │
│ 3. User adjusts options (optional)          │
│    • Expands "Advanced Options"             │
│    • Selects style dropdown                 │
│    • Selects camera angle                   │
│    • Selects lighting                       │
│                                             │
│ 4. User clicks "Generate"                   │
│    • Credit check performed                 │
│    • Button shows loading spinner           │
│    • Disabled during processing             │
│                                             │
│ 5. Redirect to Results                      │
│    • Immediate redirect                     │
│    • Loading state shown                    │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ RESULTS PAGE                                │
│                                             │
│ 6. Loading placeholders shown               │
│    • Number matches selected count          │
│    • Shimmer animation                      │
│    • "Processing..." status                 │
│    • Progress bar (if available)            │
│                                             │
│ 7. Auto-refresh every 2 seconds             │
│    • Polls generation status                │
│    • No user action required                │
│                                             │
│ 8. Images appear progressively              │
│    • Fade-in animation (staggered)          │
│    • Watermark applied (free users)         │
│    • Actions available on hover             │
│                                             │
│ 9. User interacts with results              │
│    • Click image → Zoom modal               │
│    • Download → Save to device              │
│    • Share → Native share or copy link      │
│    • Delete → Confirmation → Remove         │
│                                             │
│ 10. Success state                           │
│     • All images loaded                     │
│     • Success message shown                 │
│     • Ready for new generation              │
└─────────────────────────────────────────────┘
```

### **Credit Purchase Flow**

```
1. USER NEEDS CREDITS
   Sees "Insufficient credits" error
   OR
   Proactively goes to Settings
   ↓
2. SETTINGS PAGE
   Scrolls to "Buy Credits" section
   Expands section (if collapsed)
   ↓
3. PACKAGE SELECTION
   Reviews packages
   Compares prices and credits
   Clicks "Buy" on chosen package
   ↓
4. STRIPE CHECKOUT
   Redirected to Stripe
   Enters card details
   Completes payment
   ↓
5. PAYMENT PROCESSING
   Stripe processes payment
   Webhook notifies server
   Credits added to account
   ↓
6. RETURN TO APP
   Redirected to Settings
   Sees success toast: "Credits added!"
   Updated credit balance shown
   ↓
7. CONTINUE GENERATING
   Returns to Home
   Generates with new credits
```

---

## 7. Interactions & Animations

### **Micro-Interactions**

#### **Button Interactions**

**Hover:**
```css
/* Lift effect */
transform: translateY(-2px);

/* Enhanced shadow */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

/* Brighter border */
border-color: rgba(255, 255, 255, 0.3);

/* Transition */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Active (Click):**
```css
/* Press down */
transform: translateY(0);

/* Reduced shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

/* Instant transition */
transition: all 0.1s ease;
```

**Loading:**
```css
/* Spinner appears */
.spinner { animation: spin 1s linear infinite; }

/* Text changes */
content: "Generating...";

/* Disabled state */
opacity: 0.6;
cursor: not-allowed;
```

#### **Card Interactions**

**Hover:**
```css
/* Lift effect */
transform: translateY(-4px);

/* Enhanced shadow */
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);

/* Smooth transition */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

**Click:**
```css
/* Slight press */
transform: translateY(-2px);

/* Quick transition */
transition: all 0.2s ease;
```

#### **Input Interactions**

**Focus:**
```css
/* Bright border */
border-color: #0A76AF;

/* Focus ring */
box-shadow: 0 0 0 3px rgba(10, 118, 175, 0.1);

/* Enhanced background */
background: rgba(255, 255, 255, 0.08);

/* Smooth transition */
transition: all 0.3s ease;
```

**Typing:**
```css
/* Cursor blinks */
caret-color: #0A76AF;
```

### **Page Transitions**

#### **Route Changes**

**Exit:**
```css
/* Fade out */
opacity: 0;

/* Slight scale down */
transform: scale(0.98);

/* Duration */
transition: all 0.3s ease-out;
```

**Enter:**
```css
/* Fade in */
opacity: 1;

/* Scale to normal */
transform: scale(1);

/* Duration */
transition: all 0.3s ease-in;
```

### **Loading Animations**

#### **Shimmer Effect**

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

**Usage:**
- Loading placeholders
- Skeleton screens
- Processing states

#### **Fade In (Staggered)**

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Stagger delay */
.fade-in:nth-child(1) { animation-delay: 0s; }
.fade-in:nth-child(2) { animation-delay: 0.1s; }
.fade-in:nth-child(3) { animation-delay: 0.2s; }
.fade-in:nth-child(4) { animation-delay: 0.3s; }
```

**Usage:**
- Generated images appearing
- List items loading
- Content reveals

#### **Pulse**

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Usage:**
- Loading icons
- Processing indicators
- Attention grabbers

#### **Spin**

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}
```

**Usage:**
- Loading spinners
- Refresh icons
- Processing indicators

### **Modal Animations**

**Open:**
```css
/* Backdrop */
.backdrop {
  animation: fadeIn 0.3s ease-out;
}

/* Modal */
.modal {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Close:**
```css
/* Reverse animations */
.backdrop {
  animation: fadeOut 0.2s ease-in;
}

.modal {
  animation: scaleOut 0.2s ease-in;
}
```

### **Toast Animations**

**Slide In:**
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast {
  animation: slideIn 0.3s ease-out;
}
```

**Slide Out:**
```css
@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast-exit {
  animation: slideOut 0.2s ease-in;
}
```

---

## 8. Responsive Design

### **Breakpoint Strategy**

```css
/* Mobile First Approach */

/* Extra Small (Default) */
/* 0px - 639px */
/* Single column layouts */
/* Touch-optimized spacing */

/* Small (sm:) */
@media (min-width: 640px) {
  /* 2-column grids */
  /* Increased spacing */
}

/* Medium (md:) */
@media (min-width: 768px) {
  /* Tablet layouts */
  /* Side-by-side content */
}

/* Large (lg:) */
@media (min-width: 1024px) {
  /* Desktop layouts */
  /* Multi-column grids */
  /* Hover interactions */
}

/* Extra Large (xl:) */
@media (min-width: 1280px) {
  /* Wide desktop */
  /* Max-width containers */
}

/* 2XL (2xl:) */
@media (min-width: 1536px) {
  /* Ultra-wide */
  /* Expanded layouts */
}
```

### **Mobile Adaptations**

#### **Navigation**
- **Desktop**: Horizontal nav items
- **Mobile**: Hamburger menu (if needed) or bottom tab bar

#### **Image Grid**
- **Desktop**: 2 columns
- **Mobile**: 1 column (full width)

#### **Upload Area**
- **Desktop**: 400px height, large logo
- **Mobile**: 300px height, medium logo

#### **Buttons**
- **Desktop**: Hover effects
- **Mobile**: Larger touch targets (min 44px)

#### **Modals**
- **Desktop**: Centered, max-width 90vw
- **Mobile**: Full screen or bottom sheet

#### **Forms**
- **Desktop**: Side-by-side labels and inputs
- **Mobile**: Stacked layout

### **Touch Interactions**

#### **Tap Targets**
- Minimum size: 44px × 44px
- Spacing: 8px between targets
- Visual feedback: Instant highlight

#### **Swipe Gestures**
- **Image Gallery**: Swipe to navigate
- **Modals**: Swipe down to close
- **Lists**: Swipe to reveal actions

#### **Long Press**
- **Images**: Long press for context menu
- **Cards**: Long press for quick actions

---

## 9. Accessibility

### **Color Contrast**

All text meets WCAG 2.1 AA standards:

| Text Color | Background | Contrast Ratio | Rating |
|------------|------------|----------------|--------|
| #F5F7FA | #0A133B | 14.2:1 | AAA |
| #C8CDD5 | #0A133B | 8.5:1 | AAA |
| #8A92A0 | #0A133B | 4.8:1 | AA |

### **Keyboard Navigation**

#### **Focus Indicators**
```css
:focus-visible {
  outline: 2px solid #0A76AF;
  outline-offset: 2px;
}
```

#### **Tab Order**
- Logical flow: Top to bottom, left to right
- Skip links: Jump to main content
- Trapped focus: In modals and dropdowns

#### **Keyboard Shortcuts**
- **Esc**: Close modals, dropdowns
- **Enter**: Submit forms, activate buttons
- **Space**: Toggle checkboxes, activate buttons
- **Arrow keys**: Navigate dropdowns, galleries

### **Screen Reader Support**

#### **ARIA Labels**
```html
<!-- Buttons -->
<button aria-label="Delete image">
  <TrashIcon />
</button>

<!-- Images -->
<img 
  src="..." 
  alt="Generated fashion photography in editorial style"
/>

<!-- Loading States -->
<div aria-live="polite" aria-busy="true">
  Generating images...
</div>

<!-- Form Inputs -->
<input 
  type="text" 
  aria-label="Style selection"
  aria-describedby="style-hint"
/>
<span id="style-hint">Choose a photography style</span>
```

#### **Semantic HTML**
```html
<nav>Navigation</nav>
<main>Main content</main>
<article>Generation card</article>
<section>Settings section</section>
<button>Interactive element</button>
```

### **Alternative Text**

#### **Generated Images**
```
Format: "Generated fashion photography - [style] style - [date]"

Example: "Generated fashion photography - Editorial style - Oct 18, 2025"
```

#### **Icons**
- Decorative icons: `aria-hidden="true"`
- Functional icons: Descriptive `aria-label`

---

## 10. Design Patterns

### **Progressive Disclosure**

**Concept**: Show only essential information initially, reveal details on demand.

**Examples:**
1. **Advanced Options**: Collapsed by default, expand on click
2. **Credit Packages**: Collapsed section in Settings
3. **Image Actions**: Hidden until hover (desktop)

### **Optimistic UI**

**Concept**: Update UI immediately, assume success, revert on error.

**Examples:**
1. **Credit Deduction**: Show new balance immediately
2. **Image Delete**: Remove from UI, restore on error
3. **Favorite Toggle**: Update icon instantly

### **Skeleton Screens**

**Concept**: Show content structure while loading.

**Examples:**
1. **Results Page**: Shimmer placeholders for images
2. **History Page**: Skeleton cards while fetching
3. **Settings**: Skeleton for user profile

### **Empty States**

**Concept**: Provide guidance when no content exists.

**Components:**
- **Icon**: Relevant, friendly illustration
- **Heading**: Clear, concise message
- **Description**: Explain why empty, what to do
- **Action**: Primary button to resolve

**Examples:**
1. **No Results**: "Generate your first fashion shoot!"
2. **No History**: "Your generation history will appear here"
3. **No Credits**: "Purchase credits to continue"

### **Confirmation Dialogs**

**Concept**: Prevent accidental destructive actions.

**Structure:**
```
┌─────────────────────────────────┐
│ [!] Delete Image?               │
│                                 │
│ This action cannot be undone.   │
│                                 │
│ [Cancel]  [Delete]              │
└─────────────────────────────────┘
```

**Usage:**
- Delete images
- Logout
- Cancel generation (if implemented)

### **Feedback Mechanisms**

**Visual Feedback:**
- Button states (hover, active, disabled)
- Loading spinners
- Progress bars
- Success/error colors

**Textual Feedback:**
- Toast notifications
- Inline error messages
- Success confirmations
- Helper text

**Haptic Feedback (Mobile):**
- Button taps
- Successful actions
- Errors

---

## 📚 Design Resources

### **Figma Files** (Future)
- Component library
- Page mockups
- Design system documentation

### **Style Guide** (This Document)
- Color palette
- Typography
- Component specifications
- Interaction patterns

### **Brand Assets**
- Logo files (PNG, SVG)
- Color swatches
- Icon set

---

## 🔄 Design Iteration

### **Version History**

**v1.0.0** (Current)
- Initial glassmorphism design
- Minimalist blue theme
- Complete component library
- Responsive layouts

### **Future Enhancements**

**Planned:**
- Dark/Light mode toggle
- Custom themes
- Advanced image editing
- Batch operations
- Collaboration features

**Under Consideration:**
- Animation preferences (reduce motion)
- Font size adjustment
- High contrast mode
- Colorblind-friendly palette

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Design Team**: Fashion Muse Studio

