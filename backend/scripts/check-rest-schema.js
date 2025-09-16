require('dotenv').config();
const fetch = require('node-fetch');

async function checkSchema() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
    }

    console.log('Checking database schema using REST API...');
    
    // Check if we can connect to the database
    const tablesUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
    const tablesResponse = await fetch(tablesUrl, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json'
      }
    });
    
    if (!tablesResponse.ok) {
      const error = await tablesResponse.json();
      throw new Error(`Failed to fetch tables: ${JSON.stringify(error)}`);
    }
    
    const tables = await tablesResponse.json();
    console.log('\nAvailable tables/endpoints:');
    console.log(Object.keys(tables.definitions));
    
    // Check users table
    const usersUrl = `${supabaseUrl}/rest/v1/users?select=*&limit=1`;
    const usersResponse = await fetch(usersUrl, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!usersResponse.ok) {
      const error = await usersResponse.json();
      throw new Error(`Failed to fetch users: ${JSON.stringify(error)}`);
    }
    
    const users = await usersResponse.json();
    console.log('\nSample user data:');
    console.log(JSON.stringify(users, null, 2));
    
    // Get table schema
    const schemaUrl = `${supabaseUrl}/rest/v1/rpc/get_table_schema?table_name=users`;
    const schemaResponse = await fetch(schemaUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ table_name: 'users' })
    });
    
    if (schemaResponse.ok) {
      const schema = await schemaResponse.json();
      console.log('\nUsers table schema:');
      console.log(JSON.stringify(schema, null, 2));
    } else {
      const error = await schemaResponse.json();
      console.warn('Could not fetch table schema:', error);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
