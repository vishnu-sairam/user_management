require('dotenv').config();
const supabase = require('../config/supabase');

async function testFetch() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error executing query:', error);
      console.error('Error details:', {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      });
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Sample user data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

testFetch();
