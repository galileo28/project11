import "./App.css";
import Tasks from "./components/Tasks";
import emptySvg from "./images/empty.svg";
import { useState, useEffect } from "react";
import supabase from "./config/supabaseClient";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("tasks").select();

      if (error) {
        throw new Error("Could not fetch the tasks");
      }

      setTasks(data);
      setFetchError(null);
    } catch (error) {
      setFetchError(error.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (taskInput.trim() === "") return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ content: taskInput }])
        .select();

      if (error) {
        throw new Error("Could not add the task");
      }

      setTasks([...tasks, ...data]);
      setTaskInput("");
      fetchTasks(); 
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleUpdateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  return (
    <>
      <div className="title">
        <h1>Todo List</h1>
      </div>
      <article className="card">
        <div>
          <input
            className="task-input"
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button className="add-button" onClick={handleAddTask}>
            Add
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {fetchError && <p>{fetchError}</p>}
        {!loading && tasks.length === 0 && (
          <div className="empty-state">
            <img className="svg-home" src={emptySvg} alt="svg-background" />
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <Tasks tasks={tasks} handleUpdateTasks={handleUpdateTasks} />
        )}
      </article>
    </>
  );
}

export default App;