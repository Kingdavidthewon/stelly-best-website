# STELLY-BEST VENTURES Int'l Ltd — E-Commerce Website

Premium Nigerian Plantain — Shipped Worldwide.

## Project Overview

Full-stack e-commerce website for STELLY-BEST VENTURES Int'l Ltd, a Delta State, Nigeria-based company specializing in premium plantain products (chips and fresh plantain) with international shipping to 40+ countries.

## Project Structure

```
stellybest-website/
├── frontend/               # Client-side code (what users see)
│   ├── index.html          # Main website (all pages)
│   ├── css/                # Stylesheets (if separated later)
│   ├── js/                 # JavaScript (if separated later)
│   └── images/
│       └── products/       # Product photos go here
│
├── backend/                # Server-side code (to be built)
│   ├── server.js           # Main server entry point
│   ├── routes/             # API route definitions
│   ├── controllers/        # Business logic for each route
│   ├── models/             # Database schemas/models
│   ├── middleware/          # Auth, validation, error handling
│   ├── config/             # Database & environment config
│   └── utils/              # Helper functions (email, etc.)
│
├── docs/                   # Project documentation
├── .gitignore              # Files Git should ignore
├── .env.example            # Template for environment variables
├── package.json            # Node.js dependencies (backend)
└── README.md               # This file
```

## Current Status

### Frontend (Live)
- [x] Home page with hero, features, testimonials
- [x] Shop page with product grid and filters
- [x] Bulk Orders page with inquiry form
- [x] About Us page with company story
- [x] Contact page with form and details
- [x] FAQ page with accordion
- [x] Checkout page with shipping form & payment selection
- [x] Cart drawer with quantity controls
- [x] Product image upload support
- [x] Responsive design (mobile, tablet, desktop)

### Backend (Planned)
- [ ] Node.js/Express server
- [ ] PostgreSQL database
- [ ] Paystack/Flutterwave payment verification
- [ ] Order management API
- [ ] Product management API
- [ ] Customer accounts & authentication
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Admin dashboard
- [ ] Multi-currency support
- [ ] Shipping rate calculation

## Tech Stack

| Layer     | Technology                      |
|-----------|----------------------------------|
| Frontend  | HTML, CSS, JavaScript (vanilla)  |
| Backend   | Node.js, Express.js (planned)    |
| Database  | PostgreSQL (planned)             |
| Payments  | Paystack / Flutterwave (planned) |
| Hosting   | TBD                              |

## Getting Started

### Frontend Only (current)
Just open `frontend/index.html` in a browser. No server needed.

### Full Stack (once backend is built)
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/stellybest-website.git
cd stellybest-website

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual keys

# 4. Start the server
npm start
```

## Environment Variables

See `.env.example` for all required variables. Never commit your actual `.env` file.

## Company Info

- **Company:** STELLY-BEST VENTURES Int'l Ltd
- **HQ:** Delta State, Nigeria
- **Founded:** 2019
- **Website Email:** hello@stellybest.com (update to real email)
- **Products:** Spiced/Classic Plantain Chips, Fresh Ripe/Unripe Plantain
