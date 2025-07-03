-- Ensure foreign key constraints are properly set up
-- This script can be run to fix any relationship issues

-- Drop existing foreign key constraints if they exist
ALTER TABLE user_tools DROP CONSTRAINT IF EXISTS user_tools_user_id_fkey;
ALTER TABLE user_tools DROP CONSTRAINT IF EXISTS user_tools_tool_id_fkey;
ALTER TABLE tools DROP CONSTRAINT IF EXISTS tools_created_by_fkey;
ALTER TABLE embed_configurations DROP CONSTRAINT IF EXISTS embed_configurations_created_by_fkey;

-- Recreate foreign key constraints
ALTER TABLE user_tools 
ADD CONSTRAINT user_tools_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_tools 
ADD CONSTRAINT user_tools_tool_id_fkey 
FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;

ALTER TABLE tools 
ADD CONSTRAINT tools_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE embed_configurations 
ADD CONSTRAINT embed_configurations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
