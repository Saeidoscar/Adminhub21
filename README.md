# AdminHub21

A bilingual (English / Persian) freelance marketplace connecting employers with verified social media and e-commerce professionals. Built with React, Vite, Tailwind CSS v4, and TypeScript.

## Features

- **Bilingual UI** — Full English and Persian (RTL) support
- **Marketplace** — Browse, search, and filter admin specialists by platform, rating, and price
- **Admin Public Profiles** — Detailed profiles with bio, skills, pricing, verification, and insurance status
- **Packages & Bundles** — Platform-specific and multi-platform service packages with comparison
- **Custom Offers** — Business owners can build fully customized, platform-aware offers per admin
- **Contract Generator** — Create legally styled service agreements with payment terms and clauses
- **Package Comparison** — Side-by-side comparison of selected packages
- **AI Assistant** — MCP-powered hiring and career intelligence chat
- **Dashboards** — Separate employer and admin dashboards with overviews, contracts, and quick actions
- **Verification & Insurance** — Verified badges and contract protection with substitute coverage

## Supported Platforms

| Platform | Services |
|----------|----------|
| Instagram | Posts, Reels, Stories, DM response, ads, analytics |
| Telegram | Channel posts, Stories, DM/group response, bots, campaigns |
| WhatsApp | Catalog, broadcasts, automated replies, labels |
| Torob | Product listings, dynamic pricing, inventory sync, SEO |
| Digikala | Product listings, pricing strategy, inventory, ads |
| LinkedIn | Posts, articles, lead generation, networking |

## Tech Stack

- **Frontend**: React 19, React Router DOM 7
- **Build**: Vite 8, TypeScript 5.7
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Custom icon component set
- **State**: React Context (PackageContext)
- **Tooling**: `oxfmt` for formatting

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format
```

## Project Structure

```
src/
  components/
    layout/       — Sidebar, Topbar, Icon
    platform/     — Stars, MCPConnectorStatus
    ui/           — Badge, Button, Card, Input, Tabs, CommandPalette
    packages/     — Platform specs and package components
  contexts/       — PackageContext
  design-system/  — ThemeProvider, tokens
  lib/            — mockPackages, types, mcp-client
  pages/          — AdminPackagesPage, AdminPublicProfilePage, PackageComparisonPage
  App.tsx         — Routes and app shell
  i18n.ts         — English and Persian translations
  main.tsx        — React entrypoint
```

## License

AdminHub21
