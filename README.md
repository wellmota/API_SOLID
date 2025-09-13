# API SOLID

A GymPass-style application built with SOLID principles, featuring comprehensive gym management, user check-ins, and analytics.

## FRs (Functional Requirements)

- [x] It should be possible to register;
- [x] It should be possible to authenticate;
- [x] It should be possible to get the profile of a logged-in user;
- [x] It should be possible to get the number of check-ins made by the logged-in user;
- [x] Users should be able to get their check-in history;
- [x] Users should be able to search for nearby gyms;
- [x] Users should be able to search for gyms by name;
- [x] Users should be able to check-in at a gym;
- [x] It should be possible to validate a user's check-in;
- [x] It should be possible to register a gym;
- [x] It should be possible to get analytics and metrics;
- [x] It should be possible to validate academy distance;

## RN's (Regras de negócio)

- [x] User must not be able to register with a duplicated email
- [x] User must not be able to check-in twice a day
- [x] User must not be able to check-in if they are far from 100m from the gym
- [x] Check-in can only be validated after 20 minutes after it has been created
- [x] Check in can only be validated by admins
- [x] Register Gyms is only available for Admins

## RNF's (Requisitos não-funcionais)

- [x] User password must be encryted
- [x] Data must be persist into a PostgreSQL
- [x] All lists must be paginated with 20 items per page
- [x] User must be identified by a JWT (JSON Web Token)

## Use Cases Implemented

### User Management

- **Register**: User registration with email validation and duplicate prevention
- **Authenticate**: User authentication with JWT token generation
- **Get User Profile**: Retrieve logged-in user information

### Academy/Gym Management

- **Create Academy**: Register new academies with comprehensive validation
- **Create Gym**: Admin-only gym creation with role-based access control
- **Search Academy**: Search academies by name with advanced filtering and sorting
- **Validate Academy Distance**: Check proximity for check-in validation

### Check-in System

- **Check-in**: User check-in at academies with distance and frequency validation
- **Validate Check-in**: Admin-only check-in validation with 20-minute timer
- **Check-in History**: Comprehensive check-in history with pagination and filtering
- **Fetch User Check-in History**: Alternative history retrieval method with summary statistics

### Analytics & Metrics

- **Metrics**: Comprehensive analytics and statistics dashboard
- **Distance Validation**: Proximity-based validation system with Haversine formula

### Authentication & Authorization

- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Admin and user role management
- **Auth Middleware**: Express middleware for route protection

## Use Case Features

### Search Academy

- Case-insensitive search in titles and descriptions
- Pagination with configurable page size (1-100 items)
- Multiple sorting options: name, distance, createdAt
- Distance filtering with user coordinates
- Advanced filtering and validation

### Create Academy

- Comprehensive input validation (title, description, phone, coordinates)
- Email and URL format validation
- Opening hours format validation
- Facilities array validation
- Duplicate location prevention

### Check-in History

- Pagination support with configurable limits
- Date range filtering
- Gym-specific filtering
- Optional gym details inclusion
- Summary statistics (daily, weekly, monthly counts)
- Most frequent gym tracking

### Metrics

- Total counts (check-ins, users, gyms)
- Check-ins by date and gym
- Average check-ins per user
- Most active user identification
- Most popular gym identification
- Flexible filtering by user, gym, and date range

### Validate Check-in

- 20-minute validation timer enforcement
- Admin-only validation access
- Duplicate validation prevention
- Comprehensive error handling
- Time-based validation logic

### JWT Authentication

- Secure token generation and validation
- Token expiration handling
- Bearer token extraction
- User role verification
- Middleware-based route protection

### Role-based Access Control

- Admin and User role management
- Permission-based access control
- Route-level authorization
- User role validation
- Unauthorized access prevention

## Technical Features

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Comprehensive Testing**: Full test coverage with Vitest
- **Dependency Injection**: Factory pattern for easy testing and flexibility
- **Input Validation**: Extensive validation with meaningful error messages
- **Pagination**: Configurable pagination for all list endpoints
- **Distance Calculation**: Haversine formula for accurate geographic calculations
- **Type Safety**: Full TypeScript support with proper interfaces
- **JWT Authentication**: Secure token-based authentication with jsonwebtoken
- **Role-based Authorization**: Admin and user permission system
- **Time-based Validation**: Precise timing controls for business rules
- **Express Middleware**: Custom authentication and authorization middleware
- **Error Handling**: Comprehensive error classes and handling system

## Project Structure

```
src/
├── use-cases/           # Business logic use cases
│   ├── factories/       # Dependency injection factories
│   ├── errors/          # Custom error classes
│   └── *.spec.ts        # Test files
├── repositories/        # Data access layer
│   ├── in-memory/       # In-memory implementations
│   └── prisma/          # Database implementations
├── http/                # HTTP layer (controllers, routes)
├── lib/                 # Shared utilities and services
│   ├── jwt.ts           # JWT authentication service
│   └── auth-middleware.ts # Express authentication middleware
└── env/                 # Environment configuration
```

## Complete Feature Status

### ✅ All Requirements Completed

- **Functional Requirements**: 12/12 completed
- **Business Rules**: 6/6 completed
- **Non-Functional Requirements**: 4/4 completed

### 🎯 Key Achievements

- **100% SOLID Compliance**: All use cases follow SOLID principles
- **Complete Test Coverage**: Comprehensive test suites for all features
- **Security Implementation**: JWT authentication and role-based access control
- **Business Logic Enforcement**: All business rules properly implemented
- **Production Ready**: Full error handling and validation

---
