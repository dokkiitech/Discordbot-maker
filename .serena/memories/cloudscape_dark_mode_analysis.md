# Cloudscape Design Components - Dark Mode Analysis

## Component Analysis: Step1Repository.tsx

### File Location
`/Users/0rchid3/dev/Discordbot-maker/src/components/steps/Step1Repository.tsx`

### Cloudscape Design Components Used

#### 1. **Container** (Line 6, 72-81)
- Purpose: Wraps the entire form section
- Has header prop with Header component
- NO dark mode classes - relies on global CSS variables

#### 2. **Header** (Line 7, 74-79, 85, 159)
- Used at multiple levels:
  - Main h2 header with description (line 74-79)
  - Section h3 headers for subsections (line 85, 159)
- Variants: h2, h3
- NO dark mode styling - uses Cloudscape's default styling
- Text color determined by Cloudscape's internal theming

#### 3. **Form** (Line 15, 62-69)
- Wraps the entire form
- Has actions prop containing buttons
- NO custom dark mode classes

#### 4. **FormField** (Lines 91, 110, 128, 165, 183, 201, 232, 263, 294)
- Multiple instances for each input field
- Props used:
  - `label`: "リポジトリ名", "ブランチ名", etc.
  - `description`: Help text and links
  - `errorText`: Validation error messages
- NO dark mode styling applied
- Description contains hardcoded cyan color (line 209, 240, 271):
  ```jsx
  className="text-cyan-500 hover:underline cursor-pointer"
  ```

#### 5. **Input** (Lines 10, 96-101, 114-119, 218-223, 249-254, 280-285)
- Used for text inputs and password fields
- Props:
  - `value`: Form field value
  - `onChange`: Event handler
  - `placeholder`: Placeholder text
  - `type`: "text" or "password"
- NO dark mode classes
- Relies on Cloudscape's default styling

#### 6. **Textarea** (Lines 11, 132-137, 187-192)
- Used for repository and bot descriptions
- Props:
  - `value`: Form field value
  - `onChange`: Event handler
  - `placeholder`: Placeholder text
  - `rows`: 3 rows
- NO dark mode classes

#### 7. **Checkbox** (Line 12, 146-153)
- Used for "プライベートリポジトリとして作成"
- Props:
  - `checked`: Boolean state
  - `onChange`: Event handler
- NO dark mode styling

#### 8. **SpaceBetween** (Line 8, 64, 71, 82, 84, 158)
- Layout component for spacing
- Used for:
  - Horizontal spacing for action buttons (line 64)
  - Vertical spacing for form sections (line 71, 82, 84, 158)
- NO dark mode styling needed (layout component)

#### 9. **Button** (Line 14, 65-67)
- Single submit button "次へ"
- Props:
  - `variant="primary"`
  - `formAction="submit"`
- NO dark mode styling applied

### Form Input Areas Requiring Dark Mode

#### GitHub Repository Configuration Section
1. Repository Name (Input) - Line 96-101
2. Branch Name (Input) - Line 114-119
3. Repository Description (Textarea) - Line 132-137
4. Private Repository Checkbox - Line 146-153

#### Discord Bot Configuration Section
5. Bot Name (Input) - Line 169-174
6. Bot Description (Textarea) - Line 187-192
7. Application ID (Input) - Line 218-223
   - Has hardcoded cyan link (line 209): `text-cyan-500`
8. Public Key (Input) - Line 249-254
   - Has hardcoded cyan link (line 240): `text-cyan-500`
9. Bot Token (Input, password type) - Line 280-285
   - Has hardcoded cyan link (line 271): `text-cyan-500`
10. Deployment Type (Custom Radio Buttons) - Line 298-349
    - Custom styled with hardcoded colors:
      - Light: border-blue-500, bg-blue-50, border-gray-300, hover:border-gray-400, hover:bg-gray-50
      - Text: text-gray-900, text-gray-600
      - Checkbox: border-gray-300

## Current Styling Approach

### Global CSS Variables (globals.css)
The project uses CSS custom properties organized by theme:

**Light Mode (Default)**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted: #737373;
  --primary: #0066cc;
  --secondary: #6c757d;
  --success: #198754;
  --error: #dc3545;
  --warning: #ffc107;
  --info: #0dcaf0;
  --border: #e5e7eb;
  --card-background: #ffffff;
}
```

**Dark Mode (@media prefers-color-scheme: dark and .dark class)**
```css
--background: #1F1F21;
--foreground: #BFC1C4;
--muted: #8B8D91;
--primary: #669DF1;
--secondary: #738496;
--success: #B3DF72;
--error: #F87168;
--warning: #FBC828;
--info: #579DFF;
--border: #383C42;
--card-background: #242528;
```

### Tailwind Configuration
- Uses `darkMode: "class"` for class-based dark mode
- Custom color extensions that reference CSS variables:
  ```ts
  colors: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    muted: "var(--muted)",
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    success: "var(--success)",
    error: "var(--error)",
    warning: "var(--warning)",
    info: "var(--info)",
    border: "var(--border)",
  }
  ```

### ThemeProvider Implementation
Location: `/Users/0rchid3/dev/Discordbot-maker/src/providers/ThemeProvider.tsx`

Features:
- Manages theme state: 'light' | 'dark' | 'system'
- Persists theme preference to localStorage
- Applies CSS variables dynamically to document.documentElement
- Adds/removes 'dark' class to html element
- Listens to system theme preference changes
- Prevents hydration mismatch with mounted check

## Issues Requiring Dark Mode Fixes

### 1. Hardcoded Colors in Links (Step1Repository.tsx)
- Lines 209, 240, 271: `className="text-cyan-500 hover:underline"`
- NOT responsive to dark mode
- Should use CSS variables or Tailwind dark mode classes

### 2. Custom Deployment Type Radio Buttons (Lines 298-349)
- Line 329: `border-blue-500 bg-blue-50` - Light mode only
- Line 330: `border-gray-300 hover:border-gray-400 hover:bg-gray-50` - Light mode only
- Line 342: `text-gray-900` - Light mode only
- Line 343: `text-gray-600` - Light mode only
- Line 339: `text-blue-600 border-gray-300 focus:ring-blue-500` - Light mode only
- These need dark mode variants

### 3. Cloudscape Component Styling
- Cloudscape Design components handle their own theming through `@cloudscape-design/global-styles`
- They should automatically respond to the 'dark' class on the html element
- Need to verify if Cloudscape v3.0.1128 properly supports the 'dark' class approach

## Cloudscape Design Package Info
- Package: `@cloudscape-design/components@^3.0.1128`
- Global Styles: `@cloudscape-design/global-styles@^1.0.47`
- Imported in layout.tsx: `@cloudscape-design/global-styles/index.css`

## Custom Component Styling (UI Components)

### Input Component (src/components/ui/Input.tsx)
```tsx
// Uses inline styles with CSS variables:
style={{ backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}

// Tailwind classes:
className={cn(
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 text-foreground',
  error ? 'border-error' : 'border-border',
  className
)}
```

### Button Component (src/components/ui/Button.tsx)
```tsx
// Secondary variant has dark mode support:
'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'

// Primary and danger variants use CSS variables (good):
'bg-primary text-white hover:opacity-90 focus:ring-primary'
```

## Summary

The Step1Repository component relies on Cloudscape Design components which should handle dark mode automatically through the 'dark' class applied to the html element by ThemeProvider. However, there are hardcoded colors in:

1. **Inline Tailwind classes** for the custom radio buttons (deployment type)
2. **Hardcoded cyan links** in the description text

These need to be updated to use Tailwind's dark mode variants or CSS variable references to properly support dark mode.
