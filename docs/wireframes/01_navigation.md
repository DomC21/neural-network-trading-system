# Navigation Components

## Top Navigation Bar
```
┌──────────────────────────────────────────────────────┐
│ ┌────────────────┐ ┌─────────────────┐ ┌──────────┐ │
│ │ Service        │ │ Search Services  │ │ MSS Logo │ │
│ │ Dashboard      │ └─────────────────┘ └──────────┘ │
│ └────────────────┘                                  │
└──────────────────────────────────────────────────────┘
```

## Sidebar Navigation
```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ Navigation      │ │◄── Collapsible toggle
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ⌂ Dashboard     │ │◄── Active state
│ ├─────────────────┤ │
│ │ 📊 Reports      │ │
│ ├─────────────────┤ │
│ │ ⚙️ Settings     │ │
│ ├─────────────────┤ │
│ │ ? Help          │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### States
- Default: Text color `gray-600`
- Hover: Background `gray-100`
- Active: Background `gray-200`, Text `gray-900`
- Dark mode variants use corresponding dark colors
