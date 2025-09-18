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
    const method = event.httpMethod;

    if (method === 'GET') {
      // Get all contacts
      const contacts = readData('contacts.json');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contacts),
      };
    }

    if (method === 'POST') {
      // Create new contact message
      const data = JSON.parse(event.body);
      const validation = validateContact(data);
      
      if (!validation.valid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: validation.message }),
        };
      }

      const contacts = readData('contacts.json');
      const newContact = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
        status: 'new'
      };

      contacts.push(newContact);
      
      if (writeData('contacts.json', contacts)) {
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Message sent successfully!',
            contact: newContact 
          }),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save message' }),
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