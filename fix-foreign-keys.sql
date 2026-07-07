-- Execute this script in your Supabase SQL Editor

-- Update the foreign key on posts table
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

ALTER TABLE posts
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Update the foreign key on comments table
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Reload the schema cache so the API picks up the changes
NOTIFY pgrst, 'reload schema';
