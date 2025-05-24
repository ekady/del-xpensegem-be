# XpenseGem Backend

A robust backend service for managing personal and business expenses, built with NestJS and TypeScript.

## About

XpenseGem Backend is an expense management system that provides a comprehensive API for tracking and categorizing financial transactions. Built with NestJS.

## Features

- 💰 **Transaction Management**
  - Create, read, update, and delete transactions
  - Categorize transactions
  - Transaction summaries and analytics

- 📈 **Transaction Summaries**
  - Daily, weekly, monthly reports
  - Custom date range reports

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT
- **Containerization:** Docker
- **Testing:** Jest
- **Code Quality:** ESLint, Prettier, Husky

## Project Structure

```
src/
├── common/             # Common utilities and helpers
├── config/             # Application configuration
├── modules/            # Feature modules
│   ├── account/        # Account management
│   ├── auth/           # Authentication
│   ├── categories/     # Transaction categories
│   ├── email/          # Email notifications
│   ├── file-stream/    # File handling
│   ├── transactions/   # Transaction management
│   ├── transaction-summary/ # Transaction reports
│   └── user/           # User management
├── shared/             # Shared resources
└── main.ts             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ekady/del-xpensegem-be.git
   cd del-xpensegem-be
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Edit .env configuration
   ```

4. Start the development server:
   ```bash
   pnpm start:dev
   ```

### Docker Setup

```bash
docker compose up -d
```

## API Swagger

API swagger is available at `/swagger` when running the server.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Update documentation as needed
- Use conventional commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using NestJS
