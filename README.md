# URL Shortener Project

A MERN stack URL shortener application.

## Project Structure

URL-SHORTER-APP/
├── Backend/     # Express.js API server
├── Frontend/    # React web application
└── README.md

## Features

### Backend API

- URL shortening with optional custom shortcodes
- Automatic unique shortcode generation (nanoid)
- Configurable validity periods (default 30 minutes)
- Click tracking with geographical data (geoip-lite)
- Statistics API with detailed analytics
- MongoDB via Mongoose
- Robust error handling

### Frontend Application

- Material UI responsive UX
- Concurrent URL shortening (up to 5 URLs)
- Client-side validation
- Results with expiry display
- Copy-to-clipboard for short links

## Setup Instructions

### Installation

1. Install all dependencies from the root:
	npm run install-all

2. Backend environment variables (`Backend/.env`):
	PORT=5000
	MONGODB_URI=mongodb://localhost:27017/urlshortener
	FRONTEND_URL=`http://localhost:3000`
	BACKEND_URL=`http://localhost:5000`

### Running

- Start MongoDB (if not already running)
	mongod

- Start the backend:
	cd "Backend"
	npm run dev

- Start the frontend:
	cd "Frontend"
	npm start

	Frontend runs at `http://localhost:3000`
	Backend runs at `http://localhost:5000`

## API Endpoints

- Create Short URL
	POST /shorturls
	{
		"url": `"https://example.com/very-long-url"`,
		"validity": 30,
		"shortcode": "custom123"
	}

- List All Short URLs
	GET /shorturls

- Get Statistics
	GET /shorturls/:shortcode

- Delete Short URL
	DELETE /shorturls/:shortcode

- Redirect
	GET /:shortcode

## Notes

- Shortcodes are alphanumeric, up to 20 chars for custom input.
- If no validity is provided, defaults to 30 minutes.
- Redirection records click data with referrer and coarse geo location.
