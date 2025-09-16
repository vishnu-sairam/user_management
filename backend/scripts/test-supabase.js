require('dotenv').config();
const supabase = require('../config/supabase');

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by fetching users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log(`Found ${users.length} users in the database:`);
    console.log(users);
    
    // Test inserting a user
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Test Company',
      street: '123 Test St',
      city: 'Test City',
      zip: '12345',
      geo_lat: '40.7128',
      geo_lng: '-74.0060'
    };

    console.log('\nTesting user creation...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test user:', insertError);
      return;
    }

    console.log('Successfully created test user:');
    console.log(newUser);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();
