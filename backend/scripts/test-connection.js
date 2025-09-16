require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-connection-param': 'options=-c%20search_path=public'
          }
        }
      }
    );

    console.log('✅ Supabase client initialized');

    // Test connection by listing tables
    console.log('\n📋 Listing tables in the database...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.error('❌ Error listing tables:', tablesError);
      return;
    }

    console.log('\n📊 Available tables:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });

    // Check if users table exists
    const usersTableExists = tables.some(table => table.tablename === 'users');
    console.log(`\nℹ️  Users table exists: ${usersTableExists ? '✅ Yes' : '❌ No'}`);

    if (usersTableExists) {
      // Get users table columns
      console.log('\n🔍 Checking users table structure...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'users')
        .order('ordinal_position');

      if (columnsError) {
        console.error('❌ Error getting table columns:', columnsError);
      } else {
        console.log('\n📋 Users table columns:');
        console.table(columns);
      }

      // Try to count users
      console.log('\n👥 Counting users...');
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Error counting users:', countError);
      } else {
        console.log(`ℹ️  Found ${count} users in the database`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }
}

testConnection();
