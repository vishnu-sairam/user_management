require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  try {
    console.log('Connecting to Supabase...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if users table exists
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'users');

    if (tableError) throw tableError;
    
    if (tables.length === 0) {
      console.error('Error: users table does not exist in the database');
      return;
    }

    console.log('\nUsers table exists. Checking columns...');
    
    // Get users table columns
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (columnError) throw columnError;
    
    console.log('\nUsers table columns:');
    console.table(columns);
    
    // Try to fetch a sample user to see the structure
    console.log('\nFetching a sample user...');
    const { data: sampleUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.error('Error fetching sample user:', userError);
    } else if (sampleUser && sampleUser.length > 0) {
      console.log('\nSample user data:');
      console.log(JSON.stringify(sampleUser[0], null, 2));
    } else {
      console.log('No users found in the database.');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
