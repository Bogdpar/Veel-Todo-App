"use client"
import { useState, useEffect, FormEvent } from "react";

interface Todo {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
}

const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");

  // Получаем список todo при монтировании компонента
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=10"
      );
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Ошибка при получении списка дел:", error);
    }
  };

  const addTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo = {
      title: newTodoTitle,
      completed: false,
    };

    try {
      // Оптимистичное обновление UI: добавляем новый todo до подтверждения от сервера
      const optimisticTodo: Todo = { ...newTodo, id: Date.now() };
      setTodos((prev) => [optimisticTodo, ...prev]);

      const res = await fetch(
        "https://jsonplaceholder.typicode.com/todos",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(newTodo),
        }
      );
      const data: Todo = await res.json();

      // Обновляем todo, если сервер вернул другой id или дополнительные поля
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === optimisticTodo.id ? { ...data } : todo
        )
      );
      setNewTodoTitle("");
    } catch (error) {
      console.error("Ошибка при добавлении todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    // Оптимистичное обновление UI: удаляем todo до подтверждения удаления на сервере
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Ошибка при удалении todo:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

      {/* Форма добавления нового todo */}
      <form onSubmit={addTodo} className="mb-4">
        <input
          type="text"
          placeholder="Добавьте новое todo"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="border p-2 mr-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Добавить
        </button>
      </form>

      {/* Список todo */}
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between mb-2 border p-2 rounded"
          >
            <span className={todo.completed ? "line-through" : ""}>
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
