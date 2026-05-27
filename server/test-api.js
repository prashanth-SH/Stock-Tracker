const axios = require('axios');

async function testAPI() {
  try {
    // First, login the test user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: '123456'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // Now test the market API with the token
    const marketResponse = await axios.get('http://localhost:5000/api/market/overview', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Market overview:', marketResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();
