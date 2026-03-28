# AI Shop — AI-Powered E-Commerce Platform

A full-stack e-commerce application with an embedded AI shopping assistant powered by **Anthropic Claude**, built with **Spring Boot** + **Spring AI** backend and **React** frontend.

---

## Features

### Shopping
- Product catalog with categories, search, and filtering
- Product detail pages with image gallery, reviews, ratings
- Shopping cart with quantity management
- Checkout with shipping address and payment selection
- Order placement with email confirmation

### Orders & Tracking
- Order history with status badges and stats dashboard
- Real-time order tracking timeline
- Track by tracking number (public)
- Order cancellation
- Email notifications on status changes

### Account & Settings
- User profile management
- Multiple address management (CRUD, default selection)
- Notification preferences (email, push toggles)
- Appearance settings (theme, language)
- Password change with validation

### AI Assistant (Claude-Powered)
- Floating chatbot widget on every page
- Product recommendations based on conversation
- Answers questions about products, orders, shipping, returns
- Context-aware with full product catalog knowledge
- Suggested product cards with direct navigation

### Admin
- Product CRUD (create, update, soft-delete)
- Order status management (processing → shipped → delivered)

### Emails
- Welcome email on registration
- Order confirmation with item summary and tracking
- Status update notifications
- HTML email templates with responsive design

---

## Tech Stack

| Layer      | Technology                                    |
|------------|----------------------------------------------|
| Backend    | Spring Boot 3.3, Spring AI, Spring Security  |
| AI         | Anthropic Claude (via Spring AI)             |
| Database   | H2 (dev) / PostgreSQL (prod)                |
| Auth       | JWT (Bearer token)                           |
| Email      | Spring Mail + Gmail SMTP                     |
| Frontend   | React 18, React Router 6, Axios             |
| Styling    | Custom CSS (dark theme, fully responsive)    |
| Icons      | Lucide React                                 |
| Toasts     | React Hot Toast                              |

---

## Project Structure

```
ai-shop/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/aishop/
│       │   ├── AiShopApplication.java
│       │   ├── config/          # Security, CORS, DataSeeder
│       │   ├── controller/      # REST controllers
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── exception/       # Global error handling
│       │   ├── model/           # JPA entities
│       │   ├── repository/      # Spring Data repos
│       │   ├── security/        # JWT filter & util
│       │   └── service/         # Business logic + AI chat
│       └── resources/
│           └── application.properties
│
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── api/index.js         # Axios API layer
        ├── context/             # Auth & Cart contexts
        ├── components/          # Navbar, Sidebar, ChatWidget
        ├── pages/               # All page components
        └── styles/              # Global CSS + page styles
```

---

## Quick Start

### Prerequisites
- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** & npm
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

### 1. Backend Setup

```bash
cd backend

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Run with H2 (no database setup needed)
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080` with:
- H2 in-memory database (auto-seeded with products & demo users)
- H2 Console at `/h2-console` (JDBC URL: `jdbc:h2:mem:aishopdb`)

### 2. Frontend Setup

```bash
cd frontend

npm install
npm start
```

The frontend starts on `http://localhost:3000` and proxies API calls to `:8080`.

### 3. Login

| Account        | Email              | Password  |
|----------------|--------------------|-----------|
| Admin          | admin@aishop.com   | admin123  |
| Demo Customer  | demo@aishop.com    | demo123   |

---

## Configuration

### Environment Variables

| Variable            | Description                        | Default                    |
|---------------------|------------------------------------|----------------------------|
| `ANTHROPIC_API_KEY` | Claude AI API key                  | (required)                 |
| `JWT_SECRET`        | JWT signing secret (64+ chars)     | (auto-generated for dev)   |
| `MAIL_USERNAME`     | Gmail address for sending          | your-email@gmail.com       |
| `MAIL_PASSWORD`     | Gmail App Password                 | your-app-password          |
| `FRONTEND_URL`      | Frontend URL for email links       | http://localhost:3000      |
| `CORS_ORIGINS`      | Allowed CORS origins               | http://localhost:3000      |

### PostgreSQL (Production)

Edit `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/aishopdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### Gmail SMTP Setup
1. Enable 2FA on your Google account
2. Go to Security → App Passwords → Generate
3. Set `MAIL_USERNAME` and `MAIL_PASSWORD` env vars

---

## API Endpoints

### Auth (Public)
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login

### Products (Public GET)
- `GET /api/products` — All products
- `GET /api/products/featured` — Featured products
- `GET /api/products/{id}` — Single product
- `GET /api/products/search?q=` — Search
- `GET /api/products/categories` — Category list
- `GET /api/products/category/{cat}` — By category

### Cart (Authenticated)
- `GET /api/cart` — Get cart
- `POST /api/cart` — Add item
- `PUT /api/cart/{id}?quantity=N` — Update quantity
- `DELETE /api/cart/{id}` — Remove item
- `DELETE /api/cart` — Clear cart

### Orders (Authenticated)
- `POST /api/orders` — Place order
- `GET /api/orders` — My orders
- `GET /api/orders/{id}` — Order detail
- `GET /api/orders/stats` — Order stats
- `GET /api/orders/track/{num}` — Track by number
- `PUT /api/orders/{id}/cancel` — Cancel order

### User (Authenticated)
- `GET /api/user/profile` — Get profile
- `PUT /api/user/profile` — Update profile
- `PUT /api/user/settings` — Update settings
- `PUT /api/user/password` — Change password
- `GET/POST/PUT/DELETE /api/user/addresses` — Address CRUD

### Reviews
- `GET /api/reviews/product/{id}` — Get reviews (public)
- `POST /api/reviews/product/{id}` — Add review (auth)

### Chat (Public)
- `POST /api/chat` — Send message to AI

### Admin (ADMIN role)
- `POST/PUT/DELETE /api/admin/products` — Product CRUD
- `PUT /api/admin/orders/{id}/status` — Update order status

---

## Deployment

### Docker

```dockerfile
# Backend
FROM eclipse-temurin:17-jre
COPY backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```dockerfile
# Frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

### Build for Production

```bash
# Backend
cd backend && ./mvnw clean package -DskipTests

# Frontend
cd frontend && npm run build
```

---

## Responsive Design

The app is fully responsive across all devices:
- **Desktop** (1200px+): Full sidebar + content
- **Tablet** (768-1024px): Collapsible sidebar, adapted grids
- **Mobile** (480px-): Single column, full-screen chat, touch-optimized

---

## License

MIT
