require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Checking users table schema...');
    
    // Get table columns information
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (error) {
      console.error('Error fetching table schema:', error);
      return;
    }

    if (!columns || columns.length === 0) {
      console.log('No columns found in users table');
      return;
    }

    console.log('\nUsers table schema:');
    console.table(columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable,
      default: col.column_default
    })));

    // Check if timestamps exist
    const hasTimestamps = columns.some(col => 
      ['created_at', 'updated_at'].includes(col.column_name)
    );

    console.log('\nTimestamps status:');
    console.log(`- created_at: ${hasTimestamps ? 'Exists' : 'Missing'}`);
    console.log(`- updated_at: ${hasTimestamps ? 'Exists' : 'Missing'}`);

    if (!hasTimestamps) {
      console.log('\nNote: Timestamp columns (created_at, updated_at) are missing. Consider adding them with default values.');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
