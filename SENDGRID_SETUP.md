# SendGrid Email Integration Setup

This guide will help you set up SendGrid for sending password reset and welcome emails.

## Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://signup.sendgrid.com/)
2. Sign up for a **free account** (100 emails/day)
3. Verify your email address

## Step 2: Create API Key

1. Log in to SendGrid Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `Artisan Solar Production`
5. Select **Full Access** (or Restricted Access with Mail Send permissions)
6. Click **Create & View**
7. **COPY THE API KEY** (you won't see it again!)

## Step 3: Verify Sender Identity

SendGrid requires you to verify your sender email address:

### Option A: Single Sender Verification (Recommended for getting started)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name:** Artisan Solar
   - **From Email Address:** noreply@artisansolar.co.za
   - **Reply To:** (use your support email or same as from)
   - **Company Address:** Your business address
4. Click **Create**
5. Check your email and click the verification link

### Option B: Domain Authentication (Recommended for production)

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Enter your domain: `artisansolar.co.za`
4. Follow the instructions to add DNS records (CNAME records) to xneelo
5. Wait for DNS propagation and verification

## Step 4: Configure Railway Environment Variables

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **backend service**
3. Go to **Variables** tab
4. Add these environment variables:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@artisansolar.co.za
```

**Important:** Replace the values with:
- Your actual SendGrid API key (starts with `SG.`)
- Your verified sender email

5. Click **Save**
6. Railway will automatically redeploy

## Step 5: Test Email Sending

After Railway redeploys:

1. Visit your website: `https://artisansolar.co.za`
2. Try the **Forgot Password** flow:
   - Click "Forgot password?" on login page
   - Enter a registered email address
   - Check your inbox for the password reset email

## Email Templates Included

The integration includes two professional email templates:

### 1. Password Reset Email
- Sent when user requests password reset
- Includes secure reset link (expires in 1 hour)
- Branded with Artisan Solar colors

### 2. Welcome Email
- Sent when new user registers
- Welcomes them to the platform
- Includes link to dashboard

## Troubleshooting

### Emails not sending?

1. **Check Railway logs:**
   - Railway Dashboard → Your service → Deployments → View logs
   - Look for SendGrid errors

2. **Verify API key:**
   - Make sure `SENDGRID_API_KEY` starts with `SG.`
   - No extra spaces or quotes

3. **Verify sender email:**
   - Must match the verified email in SendGrid
   - Check SendGrid → Sender Authentication

4. **Check SendGrid activity:**
   - SendGrid Dashboard → Activity
   - Shows all sent/failed emails

### Common Issues

**"Sender email not verified"**
- Go to SendGrid → Sender Authentication
- Complete single sender or domain verification

**"403 Forbidden"**
- API key doesn't have Mail Send permissions
- Create a new API key with Full Access

**"550 Unauthenticated senders not allowed"**
- Your sender email hasn't been verified
- Complete sender verification in SendGrid

## Monitoring & Limits

**Free Tier Limits:**
- 100 emails per day
- Enough for ~50 password resets and 50 new registrations per day

**Check Usage:**
- SendGrid Dashboard → Dashboard
- Shows emails sent today and this month

**Upgrade if needed:**
- [SendGrid Pricing](https://sendgrid.com/pricing/)
- Paid plans start at $19.95/month for 50,000 emails

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** only
3. **Regenerate keys** if exposed
4. **Use restricted API keys** (Mail Send permission only)
5. **Monitor activity** in SendGrid dashboard

## Next Steps

After setup is complete, you may want to:

1. **Customize email templates** in `backend/src/services/emailService.ts`
2. **Add more email types:**
   - Booking confirmation emails
   - Payment receipt emails
   - Maintenance reminders
3. **Set up email tracking** in SendGrid (opens, clicks)
4. **Configure SPF and DKIM** for better deliverability

## Support

- **SendGrid Docs:** https://docs.sendgrid.com/
- **SendGrid Support:** https://support.sendgrid.com/

---

✅ Once configured, your Artisan Solar platform will send professional, branded emails automatically!
