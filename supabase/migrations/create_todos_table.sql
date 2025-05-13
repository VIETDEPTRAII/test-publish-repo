/*
  # Create todos table

  1. New Tables
    - `todos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, not null)
      - `completed` (boolean, default false)
      - `created_at` (timestamp with time zone, default now())
  2. Security
    - Enable RLS on `todos` table
    - Add policies for authenticated users to manage their own todos
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own todos
CREATE POLICY "Users can view their own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own todos
CREATE POLICY "Users can insert their own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own todos
CREATE POLICY "Users can update their own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own todos
CREATE POLICY "Users can delete their own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
