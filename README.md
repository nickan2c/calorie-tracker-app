# Calorie Tracker App

A modern, responsive web application for tracking daily calories, macros, and fitness goals.

## Features

- Daily tracking of calories, protein, steps, and exercises
- Calendar view with goal achievement indicators
- Weekly progress charts and consistency metrics
- Dark mode support
- Mobile-responsive design

## Tech Stack

- React.js
- Firebase (Authentication & Firestore)
- Day.js for date manipulation
- CSS Modules for styling

## Project Structure

```
src/
├── assets/           # Static assets (images, icons)
├── components/       # React components
│   ├── common/      # Reusable UI components
│   ├── layout/      # Layout components (Navbar, etc.)
│   ├── forms/       # Form-related components
│   ├── metrics/     # Metric visualization components
│   └── calendar/    # Calendar-related components
├── constants/       # Constants and configuration
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── services/       # API and service integrations
├── styles/         # CSS modules and global styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `src/firebaseConfig/firebaseConfig.js`

4. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

- Use TypeScript for type safety
- Follow the component structure guidelines
- Keep components small and focused
- Use custom hooks for complex state management
- Write unit tests for utilities and components
- Follow the CSS module pattern for styling

## Available Scripts

- `npm start`: Start development server
- `npm test`: Run test suite
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
