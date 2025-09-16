-- Add created_at and updated_at columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions if needed
-- GRANT EXECUTE ON FUNCTION update_updated_at_column() TO your_role;

-- Verify the changes
COMMENT ON COLUMN users.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the record was last updated';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;
