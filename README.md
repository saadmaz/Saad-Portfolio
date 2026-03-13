# Portfolio

A modern, professional portfolio website built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Responsive Design**: Optimized for all devices
- **Modern UI**: Clean, professional interface
- **Type-Safe**: Full TypeScript implementation
- **Scalable Architecture**: Modular, maintainable codebase
- **Performance Optimized**: Fast loading and smooth interactions

## 🏗️ Architecture

```
src/
├── app/                 # Application entry points
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # React entry point
│   └── index.css       # Global styles
├── components/         # Reusable UI components
├── pages/             # Page components
├── shared/            # Shared utilities
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility libraries
├── services/          # External services & APIs
├── types/             # TypeScript type definitions
├── constants/         # Application constants
├── data/              # Static data & content
└── assets/            # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Deployment**: Vercel

## 📁 Project Structure

This project follows an industrial-grade folder structure designed for scalability:

- **`app/`**: Application bootstrap and global configuration
- **`components/`**: Reusable UI components organized by feature
- **`pages/`**: Route-level page components
- **`shared/`**: Cross-cutting concerns (hooks, utilities, types)
- **`services/`**: API clients and external service integrations
- **`data/`**: Static content and configuration data
- **`assets/`**: Images, fonts, and other static resources

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfolio

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [Data Structure Guide](docs/PORTFOLIO_SUMMARY.md) - Complete data organization guide

## 🔧 Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting

### Folder Conventions

- Use `PascalCase` for component files (e.g., `Button.tsx`)
- Use `kebab-case` for utility files (e.g., `date-utils.ts`)
- Group related components in subfolders
- Export from `index.ts` files for clean imports

## 🚀 Deployment

This project is configured for deployment on Vercel:

```bash
# Deploy to Vercel
bun run build
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using modern web technologies.