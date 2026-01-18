# Nagrik Civic Engine 🏙️

A next-generation AI-powered civic monitoring and emergency response platform that combines computer vision, voice recognition, and citizen reporting to create a comprehensive urban safety network.

![Next.js](https://img.shields.io/badge/Next.js-16.1.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Overview

Nagrik Civic Engine is an intelligent civic monitoring system that leverages AI and IoT to detect, report, and respond to urban incidents in real-time. The platform integrates:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4ce6626d-7c39-4d7f-ab6c-949f0ac6ed8e" />

- **AI Camera Detection** - Automated incident detection using computer vision
- **Voice Reporting** - Speech-to-text emergency reporting with stress analysis
- **Citizen Portal** - Community-driven incident reporting and tracking
- **Admin Dashboard** - Comprehensive monitoring and management interface
- **Email Notifications** - Automated alerts to authorities
- **Air Quality Monitoring** - Real-time environmental data tracking

## 📋 Table of Contents
<img width="1920" height="1080" alt="Screenshot 2026-01-18 101443" src="https://github.com/user-attachments/assets/502ad0ae-78e4-4770-baff-8cb72e892cb5" />
<img width="1920" height="1080" alt="Screenshot 2026-01-18 101008" src="https://github.com/user-attachments/assets/f0fb9eca-328e-4078-ad3a-59e46428c87d" />

- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

### Core Capabilities

- ✅ **Real-time Incident Detection** - AI cameras detect accidents, traffic issues, and hazards
- ✅ **Voice Emergency Reporting** - Hands-free reporting with speech stress analysis
- ✅ **Citizen Reporting Portal** - Easy-to-use interface for community reports
- ✅ **Gemini AI Enhancement** - Automatic description improvement for all reports
- ✅ **Live Streaming** - Server-Sent Events for real-time alert updates
- ✅ **Email Notifications** - Automated alerts to authorities for critical incidents
- ✅ **Air Quality Monitoring** - Live AQI data and environmental tracking
- ✅ **Interactive Maps** - Leaflet-based visualization with heatmaps
- ✅ **Social Sharing** - Share incidents via Email, WhatsApp, and Twitter/X
- ✅ **Report Tracking** - Track incident status with unique IDs

### Advanced Features

- 🤖 **AI-Powered Description Enhancement** - Gemini API improves report clarity
- 📊 **Speech Stress Analysis** - Detects caller stress levels in voice reports
- 🗺️ **Map Action Buttons** - One-click navigation and emergency service lookup
- 📧 **Professional Email Templates** - HTML emails with incident details
- 🔄 **Duplicate Detection** - Clusters similar reports automatically
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Modern UI/UX** - Clean, professional interface with glassmorphism

## 📄 Pages & Routes

### Public Pages

#### 1. **Home Page** (`/`)
The main citizen portal with dual functionality:

**Live Updates Tab:**
- Real-time incident feed with SSE
- Interactive heatmap showing incident locations
- Issue tracking statistics
- Air Quality Index (AQI) monitoring
- Community feedback system
- Social sharing buttons (Email, WhatsApp, Twitter)

**File Report Tab:**
- Multi-step report submission form
- Issue type selection (Accident, Traffic, Pothole, etc.)
- Location picker with coordinates
- Image upload via Cloudinary
- Description enhancement via Gemini AI
- Report tracking ID generation

**Key Features:**
- Responsive 3-column layout (stats, feed, map)
- Load more functionality for infinite scroll
- Real-time toast notifications
- Track report by ID modal

#### 2. **Voice Reporting** (`/voice`)
Hands-free emergency reporting interface:

**Features:**
- Speech-to-text conversion
- Real-time transcription display
- Stress analysis visualization
- Emergency category selection
- Automatic location detection
- Voice command support

**Speech Analysis:**
- Words per second
- Repeated words detection
- Pause count and duration
- Stress confidence score
- Stress indicators visualization

#### 3. **Admin Login** (`/admin`)
Secure authentication portal:

**Features:**
- Email/password authentication
- Loading states and error handling
- Redirect to dashboard on success
- Professional login UI

### Admin Dashboard Pages

#### 4. **Dashboard** (`/admin/dashboard`)
Central command center:

**KPI Cards:**
- Total alerts count
- Active cameras
- Pending incidents
- Resolved incidents (24h)

**Quick Actions:**
- View all alerts
- Manage cameras
- Check analytics
- Access reports

**Recent Activity:**
- Latest incidents timeline
- Status indicators
- Quick action buttons

#### 5. **All Alerts** (`/admin/alerts`)
Comprehensive alert management:

**Features:**
- Search by location, type, or description
- Filter by source (camera/citizen)
- Filter by status (pending/resolved/dismissed)
- Statistics cards (total, pending, resolved, dismissed)
- Alert cards with images
- Click to view detailed modal
- Load more pagination
- Real-time updates via SSE

**Alert Card Display:**
- Large alert type (e.g., "GARBAGE PILEUP")
- Small coordinates/location
- Thumbnail image
- Timestamp and source
- Status badge
- Reporter information (if available)

#### 6. **Voice Map** (`/admin/map`)
Deprecated - Voice reports visualization (legacy)

#### 7. **Citizen Map** (`/admin/citizen-map`)
Interactive citizen reports map:

**Features:**
- Leaflet map with markers
- Collapsible sidebar with report list
- Filter by alert type
- Map action buttons for each alert:
  - Navigate (Driving)
  - Navigate (Walking)
  - Satellite View
  - Drop Pin & Share
  - Nearest Hospital
  - Nearest Fire Station
  - Nearest Police Station
- Fullscreen map mode
- User location tracking

#### 8. **Voice Reports** (`/admin/voice-reports`)
Voice report management table:

**Features:**
- Sortable data table
- Report ID with image upload
- Keyword and category
- Description
- Latitude/longitude
- Timestamp
- Severity badges
- Stress analysis data
- **Map Actions dropdown** - Compact menu with all navigation options
- Pagination controls

**Map Actions Menu:**
- Navigation section (Driving, Walking)
- View Options (Satellite, Drop Pin)
- Emergency Services (Hospital, Fire, Police)

#### 9. **Voice Analytics** (`/admin/voice-analytics`)
Voice report analytics dashboard:

**Metrics:**
- Total voice reports
- Average stress level
- High stress reports
- Response time statistics

**Visualizations:**
- Stress level distribution charts
- Time-based trends
- Category breakdown

#### 10. **Citizen Reports** (`/admin/citizen-reports`)
Citizen-submitted reports management:

**Features:**
- Same interface as All Alerts
- Filtered to show only citizen reports
- Full CRUD operations
- Status management

#### 11. **Analytics** (`/admin/analytics`)
Comprehensive analytics dashboard:

**Sections:**
- Incident trends over time
- Category distribution
- Source breakdown (camera vs citizen)
- Resolution time metrics
- Geographic heat zones
- Peak incident hours

#### 12. **Cameras** (`/admin/cameras`)
Camera network management:

**Features:**
- Camera list with status
- Live/offline indicators
- Location mapping
- Camera configuration
- Detection settings
- Status updates

#### 13. **Feedback Reports** (`/admin/feedback-reports`)
Community feedback management:

**Features:**
- Citizen feedback on incidents
- Rating system (1-5 stars)
- Comments and suggestions
- Feedback analytics

#### 14. **Air Quality** (`/admin/air-quality`)
Environmental monitoring:

**Features:**
- Real-time AQI data
- PM2.5 concentration
- Air quality trends
- Health recommendations
- Historical data charts
- Location-based monitoring

#### 15. **Authority Contact** (`/admin/authority-contact`)
Emergency contact management:

**Features:**
- Contact directory
- Emergency numbers
- Department information
- Quick dial functionality
- Contact categorization

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM
- **PostgreSQL** (Neon) - Database
- **Firebase Realtime Database** - Real-time data sync

### AI & ML
- **Google Gemini API** - Description enhancement
- **TensorFlow.js** - Browser-based ML
- **Speech Recognition API** - Voice-to-text

### Services
- **Cloudinary** - Image upload and management
- **Nodemailer** - Email notifications
- **Google Maps API** - Location services

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Google Gemini API key
- Cloudinary account
- Email service (Gmail/SMTP)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/Manjeetmathur/nagrik-civic-engine.git
cd nagrik-civic-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your credentials (see [Environment Variables](#environment-variables))

4. **Set up database**
```bash
npx prisma db push
npx prisma generate
```

5. **Run development server**
```bash
npm run dev
```

6. **Open browser**
Navigate to `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
# or
GOOGLE_API_KEY=your_google_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@nagrik.com

# Email Recipients (comma-separated)
ALERT_EMAIL_RECIPIENTS=authority1@example.com,authority2@example.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Credentials (for demo)
NEXT_PUBLIC_ADMIN_EMAIL=admin@nagrik.com
NEXT_PUBLIC_ADMIN_PASSWORD=admin123

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Firebase (for real-time features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Getting API Keys

**Gemini API:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `.env` as `GEMINI_API_KEY`

**Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get cloud name and create upload preset
3. Add to `.env`

**Gmail App Password:**
1. Enable 2-factor authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use as `EMAIL_PASSWORD`

## 📖 Usage

### For Citizens

1. **Report an Incident**
   - Visit homepage
   - Click "File Report" tab
   - Select issue type
   - Add location and description
   - Upload photo (optional)
   - Submit report
   - Save tracking ID

2. **Track a Report**
   - Click "Track ID" button
   - Enter your tracking ID
   - View report status

3. **Voice Report**
   - Visit `/voice`
   - Click microphone button
   - Speak clearly about the incident
   - System analyzes stress and transcribes
   - Submit report

### For Administrators

1. **Login**
   - Visit `/admin`
   - Enter credentials
   - Access dashboard

2. **Monitor Alerts**
   - View real-time alerts on dashboard
   - Filter by status, source, or type
   - Click alert for details
   - Update status (pending/resolved/dismissed)

3. **Manage Cameras**
   - View camera network
   - Check online/offline status
   - Configure detection settings

4. **View Analytics**
   - Access analytics dashboard
   - Review trends and metrics
   - Export reports

## 🔌 API Documentation

### Public Endpoints

#### POST `/api/report`
Submit a citizen report

**Request:**
```json
{
  "type": "ACCIDENT",
  "location": "Main Street",
  "description": "Car accident",
  "imageUrl": "https://...",
  "reporter": {
    "name": "John Doe",
    "phone": "1234567890",
    "coordinates": { "lat": 28.6139, "lng": 77.2090 }
  }
}
```

**Response:**
```json
{
  "id": "cl...",
  "type": "ACCIDENT",
  "description": "Enhanced description...",
  "originalDescription": "Car accident",
  "status": "PENDING",
  "timestamp": "2026-01-18T..."
}
```

#### POST `/api/report2`
Submit a voice report

**Request:**
```json
{
  "keyword": "fire",
  "description": "Fire in market",
  "category": "FIRE",
  "severity": "HIGH",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "source": "VOICE",
  "speechStressData": {
    "wordsPerSecond": 2.5,
    "repeatedWords": 3,
    "pauseCount": 5,
    "averagePauseDuration": 0.8,
    "confidence": 75,
    "stressIndicators": ["rapid_speech", "repeated_words"]
  }
}
```

#### GET `/api/alerts`
Get all alerts with pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
[
  {
    "id": "cl...",
    "type": "ACCIDENT",
    "location": "Main Street",
    "description": "...",
    "status": "PENDING",
    "timestamp": "2026-01-18T...",
    "source": "camera",
    "thumbnailUrl": "https://..."
  }
]
```

#### GET `/api/alerts/stream`
Server-Sent Events stream for real-time alerts

**Usage:**
```javascript
const eventSource = new EventSource('/api/alerts/stream');
eventSource.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('New alert:', alert);
};
```

### Admin Endpoints

#### PATCH `/api/alerts/[id]`
Update alert status

**Request:**
```json
{
  "status": "RESOLVED"
}
```

#### POST `/api/alerts/notify`
Send email notification for accident

**Request:**
```json
{
  "alert": {
    "id": "cl...",
    "type": "ACCIDENT",
    "location": "Main Street",
    "timestamp": "2026-01-18T...",
    "confidence": 95,
    "source": "camera",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "imageUrl": "https://..."
  }
}
```

## 🎨 Design System

### Global Utilities

The project uses a global design system defined in `globals.css`:

**Typography:**
- `.page-title` - Main page headings
- `.section-title` - Section headings

**Components:**
- `.admin-card` - Card containers
- `.shadcn-card` - Alternative card style
- `.shadcn-input` - Form inputs
- `.btn-icon` - Icon buttons
- `.btn-icon-primary` - Primary icon buttons
- `.btn-icon-secondary` - Secondary icon buttons

**Spacing:**
- `.section-spacing` - Consistent section gaps
- `.card-spacing` - Card padding

**States:**
- `.empty-state` - Empty state containers

### Color Palette

- **Primary:** Blue (#2563eb)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Danger:** Red (#ef4444)
- **Neutral:** Zinc (#71717a)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test thoroughly before submitting PR
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Manjeet Mathur** - Project Lead & Developer

## 🙏 Acknowledgments

- Google Gemini AI for description enhancement
- Cloudinary for image management
- Neon for database hosting
- Next.js team for the amazing framework
- Open source community

## 📞 Support

For support, email support@nagrik.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with city emergency services
- [ ] Blockchain-based incident verification
- [ ] Predictive incident modeling
- [ ] Community voting system

---

**Built with ❤️ for safer cities**
