import React, { useState } from 'react';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { Todo } from '../lib/supabase';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, newTitle: string) => Promise<void>;
};

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(todo.id, !todo.completed);
    setIsToggling(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(todo.id);
    setIsDeleting(false);
  };

  const handleEdit = async () => {
    if (editValue.trim() !== todo.title) {
      await onEdit(todo.id, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200 group hover:bg-gray-50 transition-colors">
      {isEditing ? (
        <div className="flex-1 flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleEdit}
            className="p-1 text-green-600 hover:text-green-800"
            aria-label="Save"
          >
            <Check size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:text-red-800"
            aria-label="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="mr-3 flex-shrink-0 h-5 w-5 rounded border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {todo.completed && <Check size={14} className="text-blue-600" />}
          </button>
          <span
            className={`flex-1 ${
              todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}
          >
            {todo.title}
          </span>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-500 hover:text-blue-600"
              aria-label="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-gray-500 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoItem;
