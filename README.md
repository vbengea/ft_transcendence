# 🎮 Frontier - Advanced Multiplayer Game Platform

<div align="center">
  <img src="src/ui/images/favicon.ico" alt="Frontier Logo" width="64" height="64"/>
  
  [![Built with Fastify](https://img.shields.io/badge/Backend-Fastify-black?style=flat-square&logo=fastify)](https://www.fastify.io/)
  [![Frontend TypeScript](https://img.shields.io/badge/Frontend-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![3D Engine](https://img.shields.io/badge/3D-Babylon.js-orange?style=flat-square&logo=babylon.js)](https://babylonjs.com/)
  [![Database](https://img.shields.io/badge/Database-SQLite-green?style=flat-square&logo=sqlite)](https://sqlite.org/)
  [![Styled with Tailwind](https://img.shields.io/badge/CSS-Tailwind-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 🌟 Overview

**Frontier** is a sophisticated Single Page Application (SPA) that brings classic arcade games into the modern era with cutting-edge 3D graphics, real-time multiplayer capabilities, and advanced security features. Built as a comprehensive gaming platform, it showcases enterprise-level web development practices with a focus on performance, security, and user experience.

### 🎯 Featured Games
- **🏓 Pong** - The classic paddle game reimagined in stunning 3D
- **❌ Tic-Tac-Toe** - Strategic gameplay with immersive 3D visuals

## ✨ Key Features

### 🔐 Advanced Authentication & Security
- **Multi-provider Authentication**: Local accounts with email/password and Google OAuth 2.0 integration
- **Two-Factor Authentication (2FA)**: TOTP-based security using authenticator apps
- **JWT Security**: Secure session management with HTTP-only cookies
- **GDPR Compliance**: Comprehensive privacy controls and data management

### 🎮 Gaming Experience
- **Real-time Multiplayer**: WebSocket-powered live gameplay for up to 4 players
- **Tournament System**: Organized brackets with automatic matchmaking
- **AI Opponents**: Intelligent computer players for single-player modes
- **3D Graphics**: Immersive gameplay powered by Babylon.js WebGL engine

### 🎨 Customization & Personalization
- **Visual Customization**: Multiple texture maps, color schemes, and camera angles
- **Personalized Profiles**: Custom avatars, usernames, and game statistics
- **Multi-language Support**: English, Spanish, and French localization
- **Responsive Design**: Optimized for desktop and mobile devices

### 💬 Social Features
- **Live Chat System**: Real-time messaging with friends and players
- **Friend Management**: Send requests, manage relationships, block users
- **Match History**: Detailed statistics and game records
- **Online Status**: See which friends are currently active

### 🛠️ Technical Excellence
- **Modern Architecture**: Microservices-based backend with clean separation of concerns
- **Database Integration**: Prisma ORM with SQLite for robust data management
- **Type Safety**: Full TypeScript implementation for enhanced development experience
- **Container Ready**: Docker support for easy deployment and scaling

## 🏗️ Architecture

### Backend Stack
- **Framework**: Fastify.js - High-performance Node.js web framework
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0 + 2FA (TOTP)
- **Real-time**: WebSocket connections for live gameplay and chat
- **Security**: bcrypt password hashing, secure cookie handling

### Frontend Stack
- **Core**: TypeScript SPA with custom routing
- **Styling**: Tailwind CSS for responsive design
- **3D Engine**: Babylon.js for WebGL-powered game graphics
- **Build Tools**: Webpack for module bundling
- **UI Components**: Dynamic templating system

### Infrastructure
- **Containerization**: Docker for consistent deployment
- **SSL/TLS**: Full HTTPS encryption
- **File Handling**: Multipart upload support for avatars
- **Internationalization**: JSON-based translation system

## 🚀 Quick Start

### Prerequisites
- Node.js 22.12.0 or higher
- Docker (optional, for containerized deployment)
- OpenSSL for SSL certificate generation

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontier
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **SSL Certificate Generation**
   ```bash
   ./tools/ssl.sh
   ```

5. **Database Setup**
   ```bash
   npm run migrate
   ```

6. **Build the application**
   ```bash
   npm run js    # Compile TypeScript
   npm run css   # Generate Tailwind CSS
   ```

7. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build and run with Docker
make build
make run

# Or use docker-compose equivalent
docker build -t frontier .
docker run --env-file .env -p 3000:3000 frontier
```

## 🎮 Game Features

### Pong 3D
- **Advanced Physics**: Realistic ball physics with angle-based bouncing
- **Multiple Camera Angles**: Lateral, player, and top-down views
- **Multiplayer Modes**: 1v1, 2v2, and tournament brackets
- **Visual Effects**: Customizable textures, materials, and lighting

### Tic-Tac-Toe 3D
- **Immersive 3D Board**: Interactive 3D grid with smooth animations
- **Strategic Gameplay**: Classic rules with modern presentation
- **Tournament Support**: Bracket-style competitions
- **Visual Customization**: Multiple themes and color schemes

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=3000
ADDRESS=localhost
TKEY=path/to/private.key
TCRT=path/to/certificate.crt

# Authentication
JWT_SECRET=your-jwt-secret
COOKIE_SECRET_KEY=your-cookie-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Database
DATABASE_URL=file:./src/server/db/data.db
```

### Game Customization
- **Maps**: 3 different texture sets (configurable per player)
- **Colors**: 7 player color options
- **Cameras**: 3 viewing angles for optimal gameplay
- **Score Limits**: Configurable winning conditions

## 📁 Project Structure

```
frontier/
├── src/
│   ├── server/           # Backend services
│   │   ├── games/        # Game logic and WebSocket handlers
│   │   ├── user-auth/    # Authentication and user management
│   │   ├── tournament/   # Tournament system
│   │   └── prisma/       # Database schema and client
│   └── ui/               # Frontend application
│       ├── pages/        # HTML templates
│       ├── ts/           # TypeScript source code
│       ├── styles/       # CSS and styling
│       ├── images/       # Game assets and UI images
│       └── languages/    # Internationalization files
├── tools/                # Development and deployment scripts
├── public/               # Compiled frontend assets
└── docker/               # Container configuration
```

## 🛡️ Security Features

- **HTTPS Enforcement**: All communications encrypted
- **CSRF Protection**: Secure cookie handling
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Protection**: Input sanitization and output encoding
- **Rate Limiting**: API endpoint protection
- **GDPR Compliance**: User data control and privacy rights

## 🌍 Internationalization

Supports multiple languages with easy extensibility:
- **English** (en_EN) - Default
- **Spanish** (es_ES) - Español
- **French** (fr_FR) - Français

Add new languages by creating translation files in `src/ui/languages/`.

## 📊 Database Schema

The application uses a robust SQLite database with the following key entities:
- **Users**: Authentication, profiles, and preferences
- **Tournaments**: Competition organization and management
- **Matches**: Game results and statistics
- **Messages**: Chat system and communications
- **Customizations**: Player appearance and game settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🏆 Project Achievements

This project demonstrates mastery of modern web development through:

- ✅ **Framework-based Backend** (Fastify.js)
- ✅ **Modern Frontend Toolkit** (TypeScript + Webpack)
- ✅ **Database Integration** (SQLite + Prisma)
- ✅ **User Management System** (Registration, Authentication, Profiles)
- ✅ **Remote Authentication** (Google OAuth 2.0)
- ✅ **Multiplayer Architecture** (WebSocket-based real-time gameplay)
- ✅ **Multiple Game Support** (Pong + Tic-Tac-Toe)
- ✅ **Game Customization** (Visual themes, settings, preferences)
- ✅ **Live Chat System** (Real-time messaging)
- ✅ **GDPR Compliance** (Privacy controls, data management)
- ✅ **Two-Factor Authentication** (TOTP security)
- ✅ **Advanced 3D Graphics** (Babylon.js WebGL engine)

---

<div align="center">
  <strong>Built with ❤️ for the modern web</strong>
</div>


