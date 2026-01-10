# Deploying Artisan Solar to xneelo

This guide will help you deploy the Artisan Solar booking system to your xneelo hosting account.

## Prerequisites

- xneelo hosting account with:
  - cPanel access
  - MySQL database support
  - Node.js support (or ability to use custom Node.js)
  - FTP/SFTP access or File Manager

## Deployment Options

xneelo offers several hosting packages. Based on your screenshot, you have access to various hosting tools. Here are deployment strategies:

### Option 1: Traditional cPanel Hosting (Recommended for Small Scale)

#### 1. Database Setup

1. Log into your xneelo cPanel
2. Go to **MySQL Databases**
3. Create a new database:
   - Database name: `artisan_solar`
   - Create a user with a strong password
   - Grant ALL PRIVILEGES to the user on the database

4. Note down:
   - Database Host (usually `localhost`)
   - Database Name
   - Database User
   - Database Password

#### 2. Backend Deployment

Since xneelo's shared hosting may not support Node.js natively, you have two options:

**Option A: Use a Node.js hosting service for the backend**
- Deploy backend to Railway, Render, or Heroku (free tiers available)
- Point your frontend to this API

**Option B: Request Node.js Support**
- Contact xneelo support to enable Node.js on your hosting account
- Many modern xneelo packages support Node.js applications

#### 3. Frontend Deployment

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to xneelo**
   - Use File Manager or FTP client
   - Navigate to `public_html` (or your domain folder)
   - Upload contents of `frontend/dist` folder
   - Your files should be directly in `public_html`, not in a subfolder

3. **Configure Environment**
   - Create `.htaccess` file in `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Option 2: Using xneelo VPS (If Available)

If you have VPS access, you get full control:

#### 1. Connect via SSH
```bash
ssh username@your-server-ip
```

#### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Install PostgreSQL
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb artisan_solar
```

#### 4. Deploy Backend
```bash
cd /var/www
git clone <your-repo-url>
cd Maintenance-Booking-Website/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
```

#### 5. Set up PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name artisan-solar-backend
pm2 save
pm2 startup
```

#### 6. Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /var/www/Maintenance-Booking-Website/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Hybrid Approach (Recommended)

1. **Backend**: Deploy to Railway.app or Render.com (free tier)
2. **Frontend**: Host on xneelo
3. **Database**: Use backend hosting provider's database

#### Railway.app Deployment (Backend)

1. **Sign up**: https://railway.app
2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select `backend` folder as root

3. **Add PostgreSQL**:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will provide `DATABASE_URL`

4. **Set Environment Variables**:
   ```
   DATABASE_URL=(automatically provided)
   JWT_SECRET=your-secret-key-here
   PAYFAST_MERCHANT_ID=your_merchant_id
   PAYFAST_MERCHANT_KEY=your_merchant_key
   PAYFAST_PASSPHRASE=your_passphrase
   PAYFAST_SANDBOX=false
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=(automatically provided by Railway)
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy**: Railway auto-deploys on git push

6. **Get Backend URL**: Copy the generated URL (e.g., `your-app.up.railway.app`)

#### Frontend on xneelo

1. **Update API URL**:
   ```bash
   cd frontend
   # Edit .env or .env.production
   echo "VITE_API_URL=https://your-app.up.railway.app/api" > .env.production
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Upload to xneelo**:
   - Upload `dist` folder contents to `public_html`
   - Add `.htaccess` (see Option 1 above)

## PayFast Configuration

1. **Sign up for PayFast**:
   - Go to https://www.payfast.co.za
   - Create a merchant account
   - Get your credentials from Settings → Integration

2. **Update Environment Variables**:
   ```
   PAYFAST_MERCHANT_ID=your_merchant_id
   PAYFAST_MERCHANT_KEY=your_merchant_key
   PAYFAST_PASSPHRASE=your_secure_passphrase
   PAYFAST_SANDBOX=false  # true for testing
   ```

3. **Configure PayFast Dashboard**:
   - Return URL: `https://yourdomain.com/payment/success`
   - Cancel URL: `https://yourdomain.com/payment/cancel`
   - Notify URL: `https://your-backend-url.com/api/payments/notify`

## SSL Certificate

xneelo provides free SSL certificates:

1. Log into cPanel
2. Go to **SSL/TLS Status**
3. Click "Run AutoSSL" for your domain
4. Wait for certificate installation

## Domain Configuration

1. In xneelo control panel, point your domain to:
   - Main domain → `public_html` folder
   - Ensure domain DNS is properly configured

## Post-Deployment Checklist

- [ ] Database is created and accessible
- [ ] Backend is running and accessible
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] Login functionality works
- [ ] Booking system works
- [ ] PayFast integration is configured
- [ ] Test payment in sandbox mode
- [ ] Switch to production PayFast
- [ ] SSL certificate is active
- [ ] Domain points to correct location

## Monitoring & Maintenance

### Using xneelo Tools

Based on your hosting tools:
- **Error Logs**: Check regularly via cPanel
- **Disk Usage**: Monitor via cPanel dashboard
- **Cronjob Manager**: Set up automated backups
- **File Manager**: Quick file access and editing
- **PHP Config**: Adjust if needed

### Backups

1. **Database Backup**:
   - Use cPanel → phpMyAdmin → Export
   - Set up daily cron job for automated backups

2. **File Backup**:
   - Use cPanel → Backup Wizard
   - Download full backup weekly

### Performance Optimization

1. **Enable Gzip Compression**:
   Add to `.htaccess`:
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
   </IfModule>
   ```

2. **Browser Caching**:
   Add to `.htaccess`:
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access 1 year"
     ExpiresByType image/jpeg "access 1 year"
     ExpiresByType image/png "access 1 year"
     ExpiresByType text/css "access 1 month"
     ExpiresByType application/javascript "access 1 month"
   </IfModule>
   ```

## Troubleshooting

### Frontend Not Loading

- Check that files are in correct directory
- Verify `.htaccess` is present
- Check file permissions (644 for files, 755 for folders)

### API Connection Issues

- Verify `VITE_API_URL` is correct in frontend build
- Check CORS settings on backend
- Ensure backend URL is accessible

### PayFast Issues

- Verify merchant credentials
- Check notify URL is accessible (not behind authentication)
- Review PayFast dashboard for transaction logs

## Support

- **xneelo Support**: support@xneelo.co.za
- **PayFast Support**: https://www.payfast.co.za/support
- **Application Issues**: Check application logs

## Estimated Costs

- **xneelo Hosting**: R99 - R299/month (depending on package)
- **PayFast**:
  - Transaction fee: 3.9% + R2 per transaction
  - No monthly fees
- **Railway.app (Backend)**: Free tier or $5/month
- **Domain**: Included with xneelo hosting

---

**Need Help?**
Contact xneelo support for hosting-specific questions or check their knowledge base at https://help.xneelo.co.za
