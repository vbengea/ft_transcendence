import fetch from 'node-fetch';
import https from 'https';

// Bypass SSL verification for local testing
const agent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:3000';


async function testAuth() {
  try {
    console.log('Registering test user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'Password123!',
        email: 'test@example.com'
      }),
      agent
    });
    
    const registerData = await registerRes.json();
    console.log('Register response:', registerData);
    
    console.log('\nLogging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!'
      }),
      agent
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('No token received');
      return;
    }
    
    console.log('\nTesting protected endpoint...');
    const testRes = await fetch(`${BASE_URL}/test-auth`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      },
      agent
    });
    
    const testData = await testRes.json();
    console.log('Protected endpoint response:', testData);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();