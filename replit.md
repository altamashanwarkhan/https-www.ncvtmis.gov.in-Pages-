# AK Institute of Technical Training - Educational Website with Certificate System

## Overview
This project delivers a professional educational institute website for "AK INSTITUTE OF TECHNICAL TRAINING," complete with a marketing platform and a robust Certificate Verification System. It features course showcases, an admin panel for certificate management, public verification of certificates, unique certificate URLs with QR codes, and persistent data storage. The system aims to provide a reliable and accessible platform for technical training and certificate validation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is built as a Single Page Application (SPA) using pure HTML5, CSS3, and JavaScript (ES6+), without frameworks or build tools. It adheres to a mobile-first responsive design principle. A defined design system utilizes CSS Custom Properties for theming, featuring a primary orange, secondary blue, and Poppins font. Icons are provided by Font Awesome 6.4.0. Responsive breakpoints are set for desktop (>968px), tablet (600px-968px), and mobile (<600px).

### Technical Implementations
**Frontend:**
- **Hero Slider:** Automatic rotation with manual navigation and dot indicators.
- **Navigation:** Fixed header, smooth scroll, active section highlighting, and a mobile hamburger menu.
- **E-Learning & Course Portfolio:** Responsive layouts showcasing courses with hover effects.
- **Statistics Counter:** Animated counters using Intersection Observer API.
- **Testimonials Carousel:** Smooth, infinite-looping horizontal carousel with auto-advance and manual controls.
- **Certificate Verification System:**
    - **Admin Panel:** Secure login, certificate creation (unique IDs like AK-CERT-XXXXXX), listing, search, copy URL, view, and delete functionalities. Includes real-time statistics.
    - **Verification Page:** Public ID-based verification with status display and error handling.
    - **Certificate Display:** Professional design with institute branding, QR code, shareable URL, and print-friendly layout.

**Backend:**
- **Flask Application:** A Flask web framework handles API endpoints, serving static files, and Jinja2 templating.
- **Database:** SQLAlchemy ORM with SQLite for persistent storage of certificate data.
- **Session Management:** Server-side, 1-hour authenticated sessions with expiry for admin access.
- **Security:** Password-protected admin access, session expiry enforcement, CSRF protection, and protected endpoints.

### Feature Specifications
- **Website Core:** Hero slider, navigation, e-learning section, course portfolio (8 safety courses), institute 'About' section, animated statistics, director's message, popular courses (3 featured), testimonials carousel, admission section, and a four-column responsive footer.
- **Certificate System:** Secure admin panel for CRUD operations on certificates, public verification page, unique certificate display pages with QR codes, and a RESTful API.

### System Design Choices
- **Database Schema:** `Certificate` table includes `id`, `certificate_id` (unique), `student_name`, `course_name`, `issue_date`, `status`, and `created_at`.
- **API Endpoints:** Includes authentication (`/api/auth/login`, `/api/auth/logout`, `/api/auth/check`) and certificate management (`/api/certificates` for list/create, `/api/certificates/:id` for get/delete).
- **Performance:** Lightweight frontend, minimal external framework overhead, smooth animations, and modern browser compatibility.

## External Dependencies

**CDN Resources:**
-   **Google Fonts:** Poppins (weights: 300, 400, 500, 600, 700) from `https://fonts.googleapis.com/css2`.
-   **Font Awesome 6.4.0:** Icons library from `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/`.
-   **Unsplash Images:** Placeholder images used for courses and about sections.

**Python Dependencies:**
-   `flask`
-   `flask-login`
-   `flask-sqlalchemy`
-   `pillow`
-   `qrcode`

**Runtime Requirements:**
-   Python 3.x
-   SQLite database (auto-created `certificates.db`)
-   Modern web browser (ES6+ support)