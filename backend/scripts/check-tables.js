const supabase = require('../config/supabase');

async function checkTables() {
  try {
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) throw error;

    console.log('Tables in database:');
    for (const table of tables) {
      console.log(`\nTable: ${table.tablename}`);
      
      // Get table structure
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.tablename);

      if (colError) {
        console.error(`Error getting columns for ${table.tablename}:`, colError);
        continue;
      }

      console.log('Columns:');
      console.table(columns);
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
