import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  firstName: string
) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@artisansolar.co.za',
      name: 'Artisan Solar',
    },
    subject: 'Reset Your Password - Artisan Solar',
    text: `Hello ${firstName},\n\nYou requested to reset your password for your Artisan Solar account.\n\nClick the link below to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this reset, please ignore this email.\n\nBest regards,\nArtisan Solar Team`,
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
      <!-- Header -->
      <div style="background-color: #f97316; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">☀️ Artisan Solar</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${firstName},
        </p>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a
            href="${resetLink}"
            style="background-color: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;"
          >
            Reset Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
          ${resetLink}
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
            ⏰ This link will expire in <strong>1 hour</strong> for security reasons.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 10px;">
            If you didn't request this password reset, please ignore this email or contact us if you have concerns.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2024 Artisan Solar. All rights reserved.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
          South Africa's trusted solar maintenance service
        </p>
      </div>
    </div>
  </body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email (for new registrations)
 */
export async function sendWelcomeEmail(email: string, firstName: string) {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@artisansolar.co.za',
      name: 'Artisan Solar',
    },
    subject: 'Welcome to Artisan Solar!',
    text: `Hello ${firstName},\n\nWelcome to Artisan Solar! We're excited to have you on board.\n\nYou can now book maintenance services for your solar system through our platform.\n\nBest regards,\nArtisan Solar Team`,
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Artisan Solar</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
      <div style="background-color: #f97316; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">☀️ Artisan Solar</h1>
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Welcome, ${firstName}!</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining Artisan Solar. We're thrilled to have you as part of our community!
        </p>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          With your account, you can:
        </p>

        <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
          <li>Book maintenance services for your solar systems</li>
          <li>Track your service history</li>
          <li>Manage your solar system details</li>
          <li>View upcoming appointments</li>
        </ul>

        <div style="text-align: center; margin: 40px 0;">
          <a
            href="${process.env.FRONTEND_URL}/dashboard"
            style="background-color: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;"
          >
            Get Started
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>

      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2024 Artisan Solar. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to: ${email}`);
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error.message);
    // Don't throw - welcome email is not critical
  }
}
