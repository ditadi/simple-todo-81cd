
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    const result = await db.insert(todosTable)
      .values({
        text: input.text,
        completed: false // Default value as per schema
      })
      .returning()
      .execute();

    // Return the created todo
    const todo = result[0];
    return {
      ...todo,
      created_at: todo.created_at // Already a Date object from timestamp column
    };
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
