# Client Import Script

This script imports client data from the CSV file and creates user accounts in the database.

## What it Does

1. **Reads CSV file**: `complete_invoice_database_FINAL.csv`
2. **Deduplicates**: Removes duplicate clients based on phone number
3. **Creates accounts**:
   - Username: `FirstName + PhoneNumber` (e.g., `ashok0824133322`)
   - Password: Phone number (hashed with bcrypt)
   - Email: Uses provided email or generates placeholder
4. **Geocodes addresses**: Uses Mapbox API to get latitude/longitude
5. **Stores location**: Saves address with geocoded coordinates for map display

## Prerequisites

1. **Mapbox API Token**: Set `VITE_MAPBOX_TOKEN` in your `.env` file
2. **Database**: Make sure your database is accessible
3. **CSV file**: Place `complete_invoice_database_FINAL.csv` in the backend root directory

## How to Run

### Option 1: Run Locally (Recommended for Testing)

```bash
cd backend

# Make sure environment variables are set in .env
# VITE_MAPBOX_TOKEN=your_mapbox_token_here
# DATABASE_URL=your_database_url_here

# Run the import
npm run import-clients
```

### Option 2: Run in Production (Railway)

**Upload CSV to Railway:**
1. SSH into Railway container or use Railway CLI
2. Upload the CSV file to the backend directory
3. Run: `npm run import-clients`

Or build it into your deployment:
1. Add CSV file to repository
2. Deploy to Railway
3. Run as a one-time job

## What Gets Imported

From CSV columns:
- **Client Name** → Split into `firstName` and `lastName`
- **Contact** → `phone` (normalized to South African format)
- **Email** → `email` (or generated placeholder)
- **Address** → Geocoded to get:
  - `latitude` / `longitude`
  - `formattedAddress`
  - `streetAddress`
  - `city`
  - `province`
  - `postalCode`

## Generated Fields

- **Username**: `FirstName + PhoneNumber` (e.g., `sunita0822602536`)
- **Password**: Phone number (hashed)
- **Role**: `CLIENT`
- **Email**: Real email or `username@placeholder.local`

## Features

✅ **Duplicate Detection**: Won't import clients with same phone/email
✅ **Geocoding**: Automatically gets coordinates for map display
✅ **Rate Limiting**: 100ms delay between geocoding requests
✅ **Error Handling**: Continues on errors, shows summary at end
✅ **Progress Logging**: Shows each client as it's imported

## Example Output

```
Reading CSV file...
Found 245 records in CSV
Found 156 unique clients after deduplication

Geocoding address for Ashok Narsai: 61 Aida Avenue, Cyrildene, Johannesburg, 2198
✓ Imported Ashok Narsai (0824133322) - Username: ashok0824133322

Geocoding address for Kyle Raman: Kyalami Hills
✓ Imported Kyle Raman (0716000259) - Username: kyle0716000259

Skipping Sunita (0822602536) - already exists

=== Import Summary ===
Total records in CSV: 245
Unique clients: 156
Successfully imported: 140
Skipped (already exist): 10
Errors: 6
```

## Accessing Imported Accounts

Clients can log in with:
- **Username**: `FirstName + PhoneNumber` (e.g., `ashok0824133322`)
- **Password**: Their phone number (e.g., `0824133322`)

They should change their password after first login!

## Viewing on Map

Once imported, you can see all clients on the map in:
**Admin Dashboard → User Locations tab**

Clients with valid addresses will appear as pins on the map.
