const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
}

const options = {
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
  },
  // Disable realtime by default
  realtime: {
    params: {
      eventsPerSecond: 0
    }
  }
};

console.log('Initializing Supabase client with options:', JSON.stringify(options, null, 2));
const supabase = createClient(supabaseUrl, supabaseKey, options);

module.exports = supabase;
