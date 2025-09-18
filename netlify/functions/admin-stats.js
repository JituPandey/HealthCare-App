const fs = require('fs');
const path = require('path');

// Simulate data directory path for serverless environment
const getDataPath = (filename) => {
  const dataDir = process.env.NETLIFY ? '/tmp' : path.join(__dirname, '../../data');
  return path.join(dataDir, filename);
};

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = process.env.NETLIFY ? '/tmp' : path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read data from file
const readData = (filename) => {
  try {
    ensureDataDir();
    const filePath = getDataPath(filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const appointments = readData('appointments.json');
    const contacts = readData('contacts.json');

    // Calculate statistics
    const stats = {
      totalAppointments: appointments.length,
      totalContacts: contacts.length,
      pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
      recentAppointments: appointments
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(apt => ({
          name: apt.name,
          doctor: apt.doctor,
          date: apt.date,
          time: apt.time
        })),
      recentContacts: contacts
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(contact => ({
          name: contact.name,
          email: contact.email,
          timestamp: contact.timestamp
        })),
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats),
    };

  } catch (error) {
    console.error('Stats function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};