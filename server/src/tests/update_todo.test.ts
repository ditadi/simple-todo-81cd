
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo completion status to true', async () => {
    // Create a todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Test todo',
        completed: false
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: true
    };

    const result = await updateTodo(testInput);

    expect(result.id).toEqual(createdTodo[0].id);
    expect(result.text).toEqual('Test todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update todo completion status to false', async () => {
    // Create a completed todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Completed todo',
        completed: true
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: false
    };

    const result = await updateTodo(testInput);

    expect(result.id).toEqual(createdTodo[0].id);
    expect(result.text).toEqual('Completed todo');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should persist changes to database', async () => {
    // Create a todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Test todo for persistence',
        completed: false
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: true
    };

    await updateTodo(testInput);

    // Verify the change was persisted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo[0].id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].text).toEqual('Test todo for persistence');
  });

  it('should throw error when todo does not exist', async () => {
    const testInput: UpdateTodoInput = {
      id: 999,
      completed: true
    };

    expect(updateTodo(testInput)).rejects.toThrow(/not found/i);
  });
});
