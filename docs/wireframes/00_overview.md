# Service Optimization Dashboard - UI Documentation

## Overall Design Theme

### Color Palette
- Primary: `#45B6B0` (Teal)
- Status Colors:
  - Profitable: `#22c55e` (Green)
  - Optimization: `#eab308` (Yellow)
  - Unprofitable: `#ef4444` (Red)
- Background: Light mode: `#f9fafb`, Dark mode: `#111827`
- Card backgrounds: Light mode: `#ffffff`, Dark mode: `#1f2937`

### Typography
- Font Family: Inter (via Tailwind)
- Hierarchy:
  - H1: 2.25rem (36px), font-bold
  - H2: 1.875rem (30px), font-semibold
  - H3: 1.5rem (24px), font-semibold
  - Body: 1rem (16px), normal
  - Small: 0.875rem (14px)

### Layout Components
```
┌──────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌────────────────────────────────────┐  │
│ │         │ │ Header                             │  │
│ │         │ ├────────────────────────────────────┤  │
│ │         │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │  │
│ │         │ │ │Metric│ │Metric│ │Metric│ │Card│ │  │
│ │Sidebar  │ │ │Card 1│ │Card 2│ │Card 3│ │ 4 │ │  │
│ │         │ │ └──────┘ └──────┘ └──────┘ └────┘ │  │
│ │         │ ├────────────────────────────────────┤  │
│ │         │ │ ┌────────────────┐ ┌────────────┐ │  │
│ │         │ │ │                │ │            │ │  │
│ │         │ │ │  Service Grid  │ │   Charts   │ │  │
│ │         │ │ │                │ │            │ │  │
│ │         │ │ └────────────────┘ └────────────┘ │  │
│ └─────────┘ └────────────────────────────────────┘  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ AI Assistant (Collapsible)                      │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Component Spacing
- Container padding: 2rem (32px)
- Grid gap: 1.5rem (24px)
- Card padding: 1.5rem (24px)
- Element spacing: 1rem (16px)
