const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper functions for file operations
async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}

async function writeDataFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await readDataFile(APPOINTMENTS_FILE);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error reading appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to read appointments' });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, email, phone, doctor, date, time } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !doctor || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    const appointments = await readDataFile(APPOINTMENTS_FILE);
    
    const newAppointment = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      doctor,
      date,
      time,
      status: 'pending'
    };
    
    appointments.push(newAppointment);
    await writeDataFile(APPOINTMENTS_FILE, appointments);
    
    res.status(201).json({ 
      success: true, 
      data: newAppointment,
      message: `Appointment booked with ${doctor}!`
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

// Get all contact messages
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await readDataFile(CONTACTS_FILE);
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error reading contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to read contacts' });
  }
});

// Create new contact message
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    const contacts = await readDataFile(CONTACTS_FILE);
    
    const newContact = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: 'unread'
    };
    
    contacts.push(newContact);
    await writeDataFile(CONTACTS_FILE, contacts);
    
    res.status(201).json({ 
      success: true, 
      data: newContact,
      message: 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Admin dashboard - get stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const appointments = await readDataFile(APPOINTMENTS_FILE);
    const contacts = await readDataFile(CONTACTS_FILE);
    
    res.json({
      success: true,
      data: {
        appointments: {
          total: appointments.length,
          pending: appointments.filter(a => a.status === 'pending').length,
          recent: appointments.slice(-5)
        },
        contacts: {
          total: contacts.length,
          unread: contacts.filter(c => c.status === 'unread').length,
          recent: contacts.slice(-5)
        }
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

// Clear all data (for testing)
app.delete('/api/admin/clear', async (req, res) => {
  try {
    await writeDataFile(APPOINTMENTS_FILE, []);
    await writeDataFile(CONTACTS_FILE, []);
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, error: 'Failed to clear data' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`🏥 HealthCare+ Server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   GET  /api/appointments - View appointments`);
    console.log(`   POST /api/appointments - Book appointment`);
    console.log(`   GET  /api/contacts     - View messages`);
    console.log(`   POST /api/contacts     - Send message`);
    console.log(`   GET  /api/admin/stats  - Admin dashboard`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
  });
}

startServer().catch(console.error);