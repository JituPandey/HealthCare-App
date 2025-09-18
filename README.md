# 🏥 HealthCare+ Web Application

A modern, responsive healthcare web application with appointment booking and contact management system.

Link:(https://jituhealth.netlify.app/)

## ✨ Features

### Frontend
- 🎨 **Glass Morphism Design** - Beautiful transparent UI with backdrop filters
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🌈 **4 Animated Backgrounds** - Interactive background switcher
- ⚡ **Smooth Animations** - CSS keyframes with Intersection Observer
- 🩺 **Healthcare Focused** - Dedicated sections for services and doctors
- 📋 **Form Validation** - Client-side validation for all forms

### Backend
- 🚀 **Node.js & Express** - Fast and lightweight server
- 📊 **REST API** - Clean API endpoints for data management
- 💾 **File Storage** - JSON-based data persistence
- 🔒 **Input Validation** - Server-side data validation
- 📈 **Admin Dashboard** - Statistics and data overview
- 🌐 **CORS Enabled** - Cross-origin resource sharing

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- CSS Grid & Flexbox
- CSS Custom Properties
- Intersection Observer API
- Fetch API

**Backend:**
- Node.js
- Express.js
- CORS middleware
- File System API

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/healthcare-app.git
   cd healthcare-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
healthcare/
├── index.html          # Main application page
├── styles.css          # Glass morphism styling & animations
├── script.js           # Frontend logic & API integration
├── server.js           # Express.js backend server
├── package.json        # Node.js dependencies
├── BACKEND.md          # Backend API documentation
├── data/               # Data storage directory
│   ├── appointments.json
│   └── contacts.json
└── README.md           # This file
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/appointments` | Get all appointments |
| `POST` | `/api/appointments` | Book new appointment |
| `GET` | `/api/contacts` | Get all messages |
| `POST` | `/api/contacts` | Send new message |
| `GET` | `/api/admin/stats` | Get admin statistics |

## 📖 Usage

### Booking an Appointment
1. Navigate to the "Book Appointment" section
2. Fill in your details (name, email, phone)
3. Select your preferred doctor
4. Choose date and time
5. Submit the form

### Sending a Message
1. Scroll to the "Contact Us" section
2. Fill in your name, email, and message
3. Submit the form

### Admin Dashboard
Visit `/api/admin/stats` to view:
- Total appointments
- Total messages
- Recent activity

## 🎨 Customization

### Changing Backgrounds
The app includes 4 background themes:
- 🌅 Gradient Waves
- 🎯 Geometric Patterns  
- 🌸 Soft Bubbles
- ⭐ Starry Night

Use the emoji switcher (bottom-left) to change themes.

### Data Storage & Checking

**Terminal Commands:**
```powershell
# View appointments
cat .\data\appointments.json

# Formatted view
Get-Content .\data\appointments.json | ConvertFrom-Json | Format-List

# Statistics
Get-Content .\data\appointments.json | ConvertFrom-Json | Measure-Object | Select-Object Count
```

**Browser:**
- All appointments: `http://localhost:3000/api/appointments`
- Admin stats: `http://localhost:3000/api/admin/stats`
- Global search bar to filter doctors and services
- Soft healthcare theme (blue/green/white), modern typography and icons

## How to run
You can open the `index.html` file directly in your browser.

On Windows (PowerShell), to launch a simple server (optional) in this folder:

```powershell
# Option 1: Python 3 (if installed)
python -m http.server 8000 ; Start-Process http://localhost:8000/index.html

# Option 2: Node.js (if installed)
npx serve . -p 8000 ; Start-Process http://localhost:8000/index.html
```

Then open `http://localhost:8000/index.html`.

## Customize
- Update doctors/services in `index.html` by editing the cards in the Services and Doctors sections.
- Styles live in `styles.css` and scripts in `script.js`.

## Notes
- Form submissions are client-side only and display success messages; wire up to a backend as needed.
- The search filters both services and doctors by name and tags.

---
© HealthCare+
