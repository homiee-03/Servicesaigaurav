# Gaurav AI Services Clone Flow (Frontend + Backend)

## Folder Structure

- `server.js` - Express backend (form save, upload, WhatsApp link generation, SQLite storage)
- `package.json` - dependencies and start script
- `index.html` - root fallback entry that redirects to `/` (prevents blank page on hosts checking root file)
- `data/registrations.db` - SQLite database file (auto-created)
- `public/index.html` - Home page
- `public/plans.html` - Intermediate plans page
- `public/details.html` - Plan details page
- `public/register.html` - Form page
- `public/payment.html` - Payment page with QR + screenshot upload
- `public/success.html` - Final confirmation page
- `public/styles.css` - shared style theme
- `public/assets/qr-placeholder.svg` - replaceable QR image
- `public/uploads/` - uploaded payment screenshots

## Run Locally

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## Deploy (Replit / Vercel)

### Replit
1. Import repo.
2. Run `npm install`.
3. Start command: `npm start`.

### Vercel
This project is an Express server app. Deploy using Node server mode (or use another Node host like Render/Railway).

## Configuration

Set these env vars as needed:

- `WHATSAPP_NUMBER` (default: `918989925852`)
- `QR_IMAGE_PATH` (default: `/assets/qr-placeholder.svg`)
- `PORT` (default: `3000`)

## Where to Replace QR Code Image

- Replace file: `public/assets/qr-placeholder.svg`
- Or set env var `QR_IMAGE_PATH` to your own hosted image URL.

## Where to Change WhatsApp Number

- Update env var: `WHATSAPP_NUMBER`
- Fallback default is in `server.js`.

## Where to Change Form Fields

- Frontend fields: `public/register.html`
- Backend validation + DB insert: `server.js` (`POST /api/register`)
- WhatsApp message format: `server.js` (`POST /api/upload/:id`)

## Data Storage

Stored in SQLite table `registrations` with columns:

- `name`
- `phone`
- `email`
- `address`
- `plan`
- `amount`
- `screenshot_url`
- `created_at`

Use endpoint `GET /api/registrations` to view entries.
