
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        text: 'Test todo to delete',
        completed: false
      })
      .returning()
      .execute();

    const todoId = insertResult[0].id;

    // Delete the todo
    const deleteInput: DeleteTodoInput = {
      id: todoId
    };

    const result = await deleteTodo(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify todo is actually removed from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false for non-existent todo', async () => {
    const deleteInput: DeleteTodoInput = {
      id: 999 // Non-existent ID
    };

    const result = await deleteTodo(deleteInput);

    // Should return false when no record was deleted
    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple test todos
    const insertResult = await db.insert(todosTable)
      .values([
        { text: 'First todo', completed: false },
        { text: 'Second todo', completed: true },
        { text: 'Third todo', completed: false }
      ])
      .returning()
      .execute();

    const todoToDelete = insertResult[1]; // Delete the middle one

    // Delete one todo
    const deleteInput: DeleteTodoInput = {
      id: todoToDelete.id
    };

    const result = await deleteTodo(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify only the target todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.some(todo => todo.id === todoToDelete.id)).toBe(false);
    expect(remainingTodos.some(todo => todo.text === 'First todo')).toBe(true);
    expect(remainingTodos.some(todo => todo.text === 'Third todo')).toBe(true);
  });
});
