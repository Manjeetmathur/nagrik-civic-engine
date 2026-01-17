import nodemailer from "nodemailer"

export interface AuthorityEmailParams {
    authorityType: 'fire' | 'hospital' | 'police'
    recipientEmail: string
    subject: string
    message: string
    priority: 'low' | 'medium' | 'high'
    location?: {
        latitude: number
        longitude: number
    }
    senderName: string
    senderEmail: string
}

export async function sendAuthorityEmail(params: AuthorityEmailParams) {
    const {
        authorityType,
        recipientEmail,
        subject,
        message,
        priority,
        location,
        senderName,
        senderEmail
    } = params

    // Validate required environment variables
    if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD) {
        console.warn("Email configuration missing. Required: ALERT_EMAIL, ALERT_EMAIL_PASSWORD")
        throw new Error("Email configuration is not set up")
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ALERT_EMAIL,
                pass: process.env.ALERT_EMAIL_PASSWORD,
            },
        })

        const authorityConfig = {
            fire: {
                icon: '🚒',
                name: 'Fire Department',
                color: '#ef4444',
                bgColor: '#fee2e2'
            },
            hospital: {
                icon: '🏥',
                name: 'Hospital/Medical Services',
                color: '#3b82f6',
                bgColor: '#dbeafe'
            },
            police: {
                icon: '🚔',
                name: 'Police Department',
                color: '#8b5cf6',
                bgColor: '#ede9fe'
            }
        }

        const config = authorityConfig[authorityType]

        const priorityConfig = {
            low: { label: 'Low Priority', color: '#10b981', bgColor: '#d1fae5' },
            medium: { label: 'Medium Priority', color: '#f59e0b', bgColor: '#fef3c7' },
            high: { label: 'High Priority', color: '#ef4444', bgColor: '#fee2e2' }
        }

        const priorityStyle = priorityConfig[priority]

        const googleMapsUrl = location
            ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
            : null

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .header-subtitle {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 500;
        }
        .priority-badge {
            display: inline-block;
            background: ${priorityStyle.bgColor};
            color: ${priorityStyle.color};
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 25px auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 2px solid ${priorityStyle.color}33;
        }
        .content {
            padding: 40px 35px;
        }
        .info-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin-bottom: 25px;
        }
        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .message-section {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            padding: 30px;
            border-radius: 12px;
            margin: 25px 0;
        }
        .message-header {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .message-text {
            color: #374151;
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-wrap;
        }
        .location-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #3b82f6;
            margin: 25px 0;
            text-align: center;
        }
        .location-coords {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
        }
        .map-link {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <span class="header-icon">${config.icon}</span>
            <h1>Official Communication</h1>
            <p class="header-subtitle">${config.name}</p>
        </div>
        
        <div class="content">
            <div class="priority-badge">⚡ ${priorityStyle.label}</div>
            
            <div class="info-section">
                <div class="info-label">📧 From</div>
                <div class="info-value">${senderName}</div>
                <div style="font-size: 14px; color: #64748b; margin-top: 4px;">${senderEmail}</div>
            </div>

            <div class="info-section">
                <div class="info-label">📋 Subject</div>
                <div class="info-value">${subject}</div>
            </div>
            
            <div class="message-section">
                <div class="message-header">
                    <span>💬</span>
                    <span>Message</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
            
            ${googleMapsUrl ? `
            <div class="location-card">
                <div class="info-label" style="margin-bottom: 10px;">📍 Location Coordinates</div>
                <div class="location-coords">
                    ${location!.latitude.toFixed(6)}, ${location!.longitude.toFixed(6)}
                </div>
                <a href="${googleMapsUrl}" target="_blank" class="map-link">
                    🗺️ Open in Google Maps
                </a>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Sent via Nagrik Civic Engine - Smart City Emergency Monitoring System
            </div>
        </div>
    </div>
</body>
</html>
        `

        const textContent = `
Official Communication to ${config.name}

Priority: ${priorityStyle.label}

From: ${senderName} (${senderEmail})
Subject: ${subject}

Message:
${message}

${location ? `Location: ${location.latitude}, ${location.longitude}\nView on Google Maps: ${googleMapsUrl}` : ''}

---
Sent via Nagrik Civic Engine - Smart City Emergency Monitoring System
        `

        const mailOptions = {
            from: `"${senderName} - Nagrik Civic Engine" <${process.env.ALERT_EMAIL}>`,
            to: recipientEmail,
            subject: `[${priorityStyle.label.toUpperCase()}] ${subject}`,
            text: textContent,
            html: htmlContent,
            replyTo: senderEmail,
        }

        await transporter.sendMail(mailOptions)
        console.log(`Authority email sent successfully to ${recipientEmail}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to send authority email:", error)
        throw error
    }
}
