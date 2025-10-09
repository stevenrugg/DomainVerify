# Domain Verification Platform - Design Guidelines

## Design Approach: Reference-Based (Plaid-Inspired)

Drawing inspiration from Plaid's verification flows, we'll create a trustworthy, professional interface that guides users through domain verification with clarity and confidence. The design emphasizes security, progress transparency, and technical precision.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 220 15% 10% (deep slate)
- Surface: 220 15% 15% (elevated slate)
- Primary: 260 80% 65% (vibrant purple)
- Accent: 200 90% 55% (trust blue)
- Success: 145 70% 50%
- Error: 0 75% 60%
- Text Primary: 220 10% 95%
- Text Secondary: 220 10% 70%

**Light Mode:**
- Background: 220 15% 98%
- Surface: 0 0% 100%
- Primary: 260 70% 55%
- Accent: 200 80% 45%

### B. Typography

- **Primary Font:** Inter (Google Fonts)
- **Monospace Font:** JetBrains Mono (for code snippets, tokens)
- **Headings:** Inter, font-semibold to font-bold
  - H1: text-4xl md:text-5xl
  - H2: text-2xl md:text-3xl
  - H3: text-xl md:text-2xl
- **Body:** Inter, text-base (16px), font-normal
- **Code/Technical:** JetBrains Mono, text-sm

### C. Layout System

**Spacing Primitives:** Consistently use 2, 4, 6, 8, 12, 16 unit increments
- Tight spacing: p-2, gap-4
- Standard: p-6, gap-6
- Generous: p-8, py-12, gap-8
- Section breaks: py-16, py-20

**Container Strategy:**
- Max width: max-w-6xl for main content
- Forms/Cards: max-w-2xl centered
- Full-width dashboard: max-w-7xl

### D. Component Library

**Navigation:**
- Top header with logo, verification status badge, account menu
- Dark surface with subtle border-bottom
- Fixed positioning for persistent access

**Forms & Input:**
- Domain input with real-time validation
- Icon prefix (globe/link icon)
- Inline error states with clear messaging
- Large, comfortable input fields (h-12 to h-14)
- Rounded corners: rounded-lg

**Verification Method Cards:**
- Two primary methods: DNS TXT Record & HTML File Upload
- Card layout with icon, title, description, "Select Method" CTA
- Hover state with subtle lift and border glow
- Selected state with primary color border

**Progress Indicators:**
- Multi-step progress bar (Input → Method → Verify → Complete)
- Numbered circles with connection lines
- Active step highlighted in primary color
- Completed steps with checkmarks

**Code Display:**
- Dark surface container (bg-slate-900/50)
- Syntax highlighting for DNS records/HTML
- Copy-to-clipboard button (top-right corner)
- Monospace font with line numbers for multi-line code
- Border with accent color when copying

**Status Cards:**
- Pending: Amber/yellow with clock icon
- Verified: Green with checkmark icon
- Failed: Red with X icon
- Large icons (size-12 to size-16)
- Clear status text and next steps

**Dashboard Table:**
- Domain, Method, Status, Date columns
- Row hover states
- Filter/search functionality
- Pagination for multiple verifications

**Call-to-Action Buttons:**
- Primary: Solid fill with primary color, white text
- Secondary: Outline with primary border
- Disabled: Reduced opacity (opacity-50)
- Loading state: Spinner icon
- Standard height: h-12, px-6

### E. Key Interactions

**Verification Flow:**
1. Hero section with domain input (centered, max-w-2xl)
2. Method selection grid (2 columns on desktop)
3. Instruction panel with step-by-step guidance
4. Real-time verification status with polling indicator
5. Success screen with celebration micro-interaction

**Page Structure:**
- **Home/Landing:** Hero with domain input, "How it Works" (3-column feature grid), trust indicators (customer logos/stats)
- **Verification Flow:** Centered card-based layout, step progress at top, clear CTAs
- **Dashboard:** Table view with filters, status badges, action buttons

### F. Visual Enhancements

**Icons:** Heroicons (outline for secondary, solid for primary actions)

**Animations:** Minimal and purposeful
- Form validation: Shake on error
- Success: Subtle checkmark scale-in
- Loading: Spin animation on verification check
- Code copy: Brief color pulse

**Images Section:**
- **Hero Background:** Abstract gradient mesh (purple/blue) with subtle animated particles - NOT a large photo
- **Feature Icons:** Illustrated icons for DNS, File Upload, API methods
- **Trust Indicators:** Client/partner logos in grayscale (colorize on hover)

**Micro-interactions:**
- Button hover: Slight scale (scale-105) + brightness increase
- Card hover: Lift (shadow-lg) + border glow
- Input focus: Border color transition to primary
- Copy feedback: Toast notification (bottom-right)

## Design Principles

1. **Trust Through Clarity:** Every step is explained with visual and textual guidance
2. **Technical Precision:** Code snippets are formatted perfectly with copy functionality
3. **Progress Transparency:** Users always know where they are in the verification process
4. **Professional Aesthetic:** Clean, modern interface that inspires confidence
5. **Responsive Flow:** Seamless experience from desktop to mobile (stack columns, adjust spacing)

This design balances Plaid's professional verification aesthetics with domain-specific technical requirements, creating a trustworthy and efficient user experience.