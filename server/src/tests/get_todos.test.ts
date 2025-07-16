
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();

    expect(result).toEqual([]);
  });

  it('should return all todos ordered by created_at desc', async () => {
    // Create test todos with explicit timestamps to ensure proper ordering
    const now = new Date();
    const firstTime = new Date(now.getTime() - 2000); // 2 seconds ago
    const secondTime = new Date(now.getTime() - 1000); // 1 second ago
    const thirdTime = new Date(now.getTime()); // now

    await db.insert(todosTable).values([
      { text: 'First todo', completed: false, created_at: firstTime },
      { text: 'Second todo', completed: true, created_at: secondTime },
      { text: 'Third todo', completed: false, created_at: thirdTime }
    ]).execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    
    // Verify all todos are returned with correct properties
    result.forEach(todo => {
      expect(todo.id).toBeDefined();
      expect(typeof todo.text).toBe('string');
      expect(typeof todo.completed).toBe('boolean');
      expect(todo.created_at).toBeInstanceOf(Date);
    });

    // Verify ordering (newest first)
    expect(result[0].text).toBe('Third todo');
    expect(result[1].text).toBe('Second todo');
    expect(result[2].text).toBe('First todo');

    // Verify completion status is preserved
    expect(result[0].completed).toBe(false);
    expect(result[1].completed).toBe(true);
    expect(result[2].completed).toBe(false);
  });

  it('should handle both completed and incomplete todos', async () => {
    // Create mixed completion status todos
    await db.insert(todosTable).values([
      { text: 'Completed task', completed: true },
      { text: 'Incomplete task', completed: false }
    ]).execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);

    const completedTodo = result.find(todo => todo.completed);
    const incompleteTodo = result.find(todo => !todo.completed);

    expect(completedTodo).toBeDefined();
    expect(completedTodo?.text).toBe('Completed task');
    expect(incompleteTodo).toBeDefined();
    expect(incompleteTodo?.text).toBe('Incomplete task');
  });
});
