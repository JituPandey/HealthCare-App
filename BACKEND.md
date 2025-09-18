# Backend Setup Instructions

## 🚀 Quick Start

### 1. Install Node.js Dependencies
```powershell
npm install
```

### 2. Start the Server
```powershell
npm start
```

### 3. Open Your App
The server will automatically serve your app at: **http://localhost:3000**

## 📊 API Endpoints

### Appointments
- `GET /api/appointments` - View all appointments
- `POST /api/appointments` - Book new appointment

### Contact Messages  
- `GET /api/contacts` - View all messages
- `POST /api/contacts` - Send new message

### Admin
- `GET /api/admin/stats` - Get statistics dashboard
- `DELETE /api/admin/clear` - Clear all data (for testing)

## 🗃️ Data Storage

- **Location**: `data/` folder (created automatically)
- **Files**: 
  - `appointments.json` - All appointment bookings
  - `contacts.json` - All contact messages
- **Format**: JSON arrays with timestamps and IDs

## 🔧 Features Added

### Server-Side Validation
- ✅ Required field validation
- ✅ Email format validation  
- ✅ Data sanitization (trim whitespace)
- ✅ Automatic status tracking

### Error Handling
- ✅ Graceful API error responses
- ✅ File system error handling
- ✅ Network error handling in frontend

### Data Management
- ✅ Persistent file-based storage
- ✅ Unique IDs and timestamps
- ✅ Status tracking (pending/unread)
- ✅ Admin clear functionality

## 🎯 Production Notes

For production deployment, consider:
- Use a real database (PostgreSQL, MongoDB)
- Add authentication/authorization
- Add rate limiting
- Use environment variables for config
- Add logging and monitoring
- Add email notifications for appointments

## 🔄 Migration from localStorage

Your existing localStorage data will be replaced by server data. The frontend now:
- ✅ Makes API calls instead of localStorage
- ✅ Shows server-side validation errors
- ✅ Displays status badges for data items
- ✅ Handles network errors gracefully