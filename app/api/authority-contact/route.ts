import { NextRequest, NextResponse } from 'next/server'
import { sendAuthorityEmail, AuthorityEmailParams } from '@/utils/authoritymailer'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            authorityType,
            recipientEmail,
            subject,
            message,
            priority,
            location,
            senderName,
            senderEmail
        } = body

        // Validate required fields
        if (!authorityType || !recipientEmail || !subject || !message || !priority || !senderName || !senderEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate authority type
        if (!['fire', 'hospital', 'police'].includes(authorityType)) {
            return NextResponse.json(
                { error: 'Invalid authority type' },
                { status: 400 }
            )
        }

        // Validate priority
        if (!['low', 'medium', 'high'].includes(priority)) {
            return NextResponse.json(
                { error: 'Invalid priority level' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(recipientEmail) || !emailRegex.test(senderEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const params: AuthorityEmailParams = {
            authorityType,
            recipientEmail,
            subject,
            message,
            priority,
            location,
            senderName,
            senderEmail
        }

        await sendAuthorityEmail(params)

        return NextResponse.json(
            {
                success: true,
                message: 'Email sent successfully to authority'
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error sending authority email:', error)
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
