# IFEN Dashboard

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red)](#license)

A modern web dashboard for IFEN built with Next.js 15, React 19, and Tailwind CSS 4. Provides tools for neurofeedback training management, including module tracking, Zoom meeting integration, and user management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Module Management**: Track certification modules with progress indicators
- **Zoom Integration**: Direct Zoom meeting access and management
- **User Dashboard**: Profile management, notifications, and language switching
- **Accessibility**: Built with WCAG guidelines in mind
- **Modern UI**: Clean interface with custom design system

## Tech Stack

- **Framework**: Next.js 15.5.3
- **Frontend**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Build Tool**: Turbopack

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ifen-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Building

Build the application for production:

```bash
npm run build
```

## Deployment

After building, start the production server:

```bash
npm start
```

## Project Structure

```
ifen-dashboard/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI component library
│   │   └── index.ts        # Component exports
│   └── lib/                # Utilities and helpers
│       ├── utils.ts        # Utility functions
│       └── index.ts
├── public/                 # Static assets
│   └── images/
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Documentation

- **[Interaction History System](./docs/INTERACTION_HISTORY_SYSTEM.md)** - Table row interaction tracking and highlighting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.