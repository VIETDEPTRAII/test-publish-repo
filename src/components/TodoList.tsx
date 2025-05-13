import React, { useState, useEffect } from 'react';
import { supabase, Todo } from '../lib/supabase';
import TodoItem from './TodoItem';
import { LogOut, PlusCircle, Loader } from 'lucide-react';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetchTodos();

    // Set up realtime subscription
    const subscription = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setAdding(true);
      const { error } = await supabase.from('todos').insert([
        {
          title: newTodo.trim(),
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Todo List</h1>
        <button
          onClick={handleSignOut}
          className="text-white hover:text-blue-200 flex items-center"
          aria-label="Sign out"
        >
          <LogOut size={18} className="mr-1" />
          <span className="text-sm">Sign out</span>
        </button>
      </div>

      <form onSubmit={addTodo} className="p-4 border-b border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={adding || !newTodo.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
          >
            {adding ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <PlusCircle size={18} />
            )}
            <span className="ml-1">Add</span>
          </button>
        </div>
      </form>

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader size={24} className="animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading your todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>You don't have any todos yet. Add one to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
