require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test user data
const testUser = {
  name: 'Test User CRUD',
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

async function testCRUD() {
  try {
    console.log('🚀 Starting CRUD tests...\n');
    
    // Test 1: Create a user
    console.log('1️⃣ Testing CREATE operation...');
    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (createError) throw createError;
    
    userId = createdUser.id;
    console.log('✅ User created successfully:', {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name
    });

    // Test 2: Read the created user
    console.log('\n2️⃣ Testing READ operation...');
    const { data: readUser, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (readError) throw readError;
    console.log('✅ User retrieved successfully:', {
      id: readUser.id,
      email: readUser.email
    });

    // Test 3: Update the user
    console.log('\n3️⃣ Testing UPDATE operation...');
    const updatedData = { name: 'Updated Test User', company: 'Updated Company' };
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log('✅ User updated successfully:', {
      name: updatedUser.name,
      company: updatedUser.company
    });

    // Test 4: Delete the user
    console.log('\n4️⃣ Testing DELETE operation...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;
    console.log('✅ User deleted successfully');

    // Verify deletion
    const { data: deletedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!deletedUser) {
      console.log('✅ Verification: User is no longer in the database');
    }

    console.log('\n🎉 All CRUD tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    
    // Clean up if user was created but other tests failed
    if (userId) {
      console.log('\n🧹 Cleaning up test data...');
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      console.log('🧹 Test data cleaned up');
    }
    
    process.exit(1);
  }
}

testCRUD();
