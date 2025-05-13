import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import TodoList from './components/TodoList';
import { CheckSquare, AlertCircle, Database } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your-supabase-url' || 
        supabaseAnonKey === 'your-supabase-anon-key' ||
        supabaseUrl === 'https://placeholder-url.supabase.co') {
      setConfigError(true);
      setLoading(false);
      return;
    }

    // Check if the todos table exists
    const checkDatabase = async () => {
      try {
        const { error } = await supabase.from('todos').select('id').limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist error
          setDbError(true);
        }
      } catch (err) {
        console.error("Error checking database:", err);
        setDbError(true);
      }
    };

    checkDatabase();

    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Configuration Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">
              Supabase environment variables are not properly configured. Please update your .env file with valid Supabase credentials.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Required Steps:</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in the project root (if not already present)</li>
              <li>Add your Supabase URL: <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL=your-project-url</code></li>
              <li>Add your Supabase anon key: <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY=your-anon-key</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
          <div className="flex items-center justify-center text-amber-600 mb-4">
            <Database size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Database Setup Required</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-amber-700">
              The required database tables don't appear to be set up in your Supabase project.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Required Steps:</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Run the following SQL to create the necessary tables:</li>
              <div className="bg-gray-800 text-gray-200 p-3 rounded-md text-sm mt-2 overflow-auto">
                <pre>{`CREATE TABLE IF NOT EXISTS todos (
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
  USING (auth.uid() = user_id);`}</pre>
              </div>
              <li>Refresh this page after creating the tables</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
      {!session ? (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <CheckSquare size={48} className="mx-auto text-blue-600" />
            <h1 className="mt-4 text-4xl font-bold text-gray-900">TaskMaster</h1>
            <p className="mt-2 text-gray-600">Your personal todo manager</p>
          </div>
          <Auth onLogin={() => {}} />
        </div>
      ) : (
        <TodoList />
      )}
    </div>
  );
}

export default App;
