const fs = require('fs');
const path = require('path');

// Simulate data directory path for serverless environment
const getDataPath = (filename) => {
  // In serverless, we'll use /tmp directory or environment variables
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

// Write data to file
const writeData = (filename, data) => {
  try {
    ensureDataDir();
    const filePath = getDataPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// Validate appointment data
const validateAppointment = (data) => {
  const required = ['name', 'email', 'phone', 'doctor', 'date', 'time'];
  for (const field of required) {
    if (!data[field] || data[field].trim() === '') {
      return { valid: false, message: `${field} is required` };
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Validate contact data
const validateContact = (data) => {
  const required = ['name', 'email', 'message'];
  for (const field of required) {
    if (!data[field] || data[field].trim() === '') {
      return { valid: false, message: `${field} is required` };
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  try {
    const path = event.path.replace('/.netlify/functions/appointments', '');
    const method = event.httpMethod;

    if (method === 'GET') {
      // Get all appointments
      const appointments = readData('appointments.json');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(appointments),
      };
    }

    if (method === 'POST') {
      // Create new appointment
      const data = JSON.parse(event.body);
      const validation = validateAppointment(data);
      
      if (!validation.valid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: validation.message }),
        };
      }

      const appointments = readData('appointments.json');
      const newAppointment = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
        status: 'pending'
      };

      appointments.push(newAppointment);
      
      if (writeData('appointments.json', appointments)) {
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Appointment booked successfully!',
            appointment: newAppointment 
          }),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save appointment' }),
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};