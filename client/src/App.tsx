
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsLoading(true);
    try {
      const todoData: CreateTodoInput = { text: newTodoText.trim() };
      const newTodo = await trpc.createTodo.mutate(todoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoText('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await trpc.updateTodo.mutate({
        id: todo.id,
        completed: !todo.completed
      });
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      await trpc.deleteTodo.mutate({ id: todoId });
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ Todo App</h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-2">
              <Input
                value={newTodoText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTodoText(e.target.value)
                }
                placeholder="What needs to be done?"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !newTodoText.trim()}>
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {totalCount > 0 && (
          <Card className="mb-4 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📊 Progress: {completedCount} of {totalCount} completed</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Your Todos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-8">
                <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No todos yet!</p>
                <p className="text-gray-400 text-sm">Add your first todo above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo: Todo, index: number) => (
                  <div key={todo.id}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleComplete(todo)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            todo.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-900'
                          }`}
                        >
                          {todo.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {todo.created_at.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {index < todos.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            💡 <strong>Note:</strong> This app uses stub backend handlers. 
            The data will reset when you refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
