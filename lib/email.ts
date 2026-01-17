import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

interface AccidentAlert {
    id: string;
    type: string;
    location: string;
    timestamp: Date;
    confidence?: number;
    cameraId?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
}

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

export async function sendEmail(options: EmailOptions) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

export async function sendAccidentAlert(alert: AccidentAlert) {
    const recipients = process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [];

    if (recipients.length === 0) {
        console.warn('No email recipients configured for accident alerts');
        return { success: false, error: 'No recipients configured' };
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?trackId=${alert.id}`;
    const mapsUrl = alert.latitude && alert.longitude
        ? `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`
        : null;

    const subject = `🚨 URGENT: ${alert.type} Detected - ${alert.location}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: white; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button:hover { background: #1d4ed8; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .urgent { color: #dc2626; font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 ACCIDENT ALERT</h1>
          <p style="margin: 10px 0 0 0;">Nagrik Civic Engine - AI Camera Detection</p>
        </div>
        
        <div class="content">
          <p class="urgent">⚠️ IMMEDIATE ATTENTION REQUIRED</p>
          
          <div class="alert-box">
            <h2 style="margin-top: 0; color: #dc2626;">Incident Details</h2>
            
            <div class="detail-row">
              <span class="detail-label">Alert Type:</span>
              <span class="detail-value">${alert.type}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${alert.location}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span class="detail-value">${new Date(alert.timestamp).toLocaleString()}</span>
            </div>
            
            ${alert.confidence ? `
            <div class="detail-row">
              <span class="detail-label">Detection Confidence:</span>
              <span class="detail-value">${alert.confidence}%</span>
            </div>
            ` : ''}
            
            ${alert.cameraId ? `
            <div class="detail-row">
              <span class="detail-label">Camera ID:</span>
              <span class="detail-value">${alert.cameraId}</span>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <span class="detail-label">Alert ID:</span>
              <span class="detail-value">${alert.id}</span>
            </div>
          </div>
          
          ${alert.imageUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${alert.imageUrl}" alt="Incident Photo" style="max-width: 100%; border-radius: 8px; border: 2px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">Camera snapshot at time of detection</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" class="button">📋 View Full Report</a>
            ${mapsUrl ? `<a href="${mapsUrl}" class="button">🗺️ Open in Maps</a>` : ''}
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <strong>⚡ Action Required:</strong>
            <p style="margin: 5px 0 0 0;">Please dispatch emergency services to the location immediately. This is an automated alert from the Nagrik AI surveillance system.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Nagrik Civic Engine</p>
          <p>Do not reply to this email. For support, contact admin@nagrik.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return await sendEmail({
        to: recipients,
        subject,
        html,
    });
}
