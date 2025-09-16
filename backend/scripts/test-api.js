const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'API Test User',
  email: `test-${Date.now()}@example.com`,
  phone: '+1234567890',
  company: 'Test Company',
  street: '123 Test St',
  city: 'Test City',
  zip: '12345',
  geo_lat: '40.7128',
  geo_lng: '-74.0060'
};

let userId;

async function testAPI() {
  try {
    console.log('🚀 Starting API tests...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get('http://localhost:5000/db-health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Create a user
    console.log('\n2️⃣ Testing user creation...');
    const createResponse = await axios.post(`${API_BASE_URL}/users`, testUser);
    userId = createResponse.data.data.id;
    console.log('✅ User created successfully:', {
      id: userId,
      email: testUser.email
    });
    
    // Test 3: Get all users
    console.log('\n3️⃣ Testing get all users...');
    const allUsersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log(`✅ Found ${allUsersResponse.data.data.length} users`);
    
    // Test 4: Get user by ID
    console.log('\n4️⃣ Testing get user by ID...');
    const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}`);
    console.log('✅ Retrieved user:', userResponse.data.data.name);
    
    // Test 5: Update user
    console.log('\n5️⃣ Testing user update...');
    const updateResponse = await axios.put(`${API_BASE_URL}/users/${userId}`, {
      name: 'Updated Test User',
      company: 'Updated Company'
    });
    console.log('✅ User updated successfully');
    
    // Test 6: Delete user
    console.log('\n6️⃣ Testing user deletion...');
    await axios.delete(`${API_BASE_URL}/users/${userId}`);
    console.log('✅ User deleted successfully');
    
    console.log('\n🎉 All API tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      config: error.config ? {
        method: error.config.method,
        url: error.config.url,
        data: error.config.data
      } : 'No config'
    });
    
    // Clean up if user was created but other tests failed
    if (userId) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        console.log('🧹 Test data cleaned up');
      } catch (cleanupError) {
        console.error('❌ Failed to clean up test data:', cleanupError.message);
      }
    }
    
    process.exit(1);
  }
}

testAPI();
