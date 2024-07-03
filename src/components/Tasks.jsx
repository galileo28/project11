import { useState } from "react";
import deleteIcon from "../images/delete-icon.svg";
import editIcon from "../images/edit-icon.svg";
import supabase from "../config/supabaseClient";

function Tasks({ tasks, handleUpdateTasks }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleEdit = (taskId) => {
    setEditingTaskId(taskId);
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      setEditedContent(task.content);
    }
  };

  const handleCloseEdit = () => {
    setEditingTaskId(null);
    setShowSaveModal(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ content: editedContent })
        .eq("id", editingTaskId);

      if (error) {
        throw new Error("Could not update the task");
      }

      const updatedTasks = tasks.map((task) =>
        task.id === editingTaskId ? { ...task, content: editedContent } : task
      );

      handleUpdateTasks(updatedTasks);
      setEditingTaskId(null);
      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving task:", error.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        throw new Error("Could not delete the task");
      }

      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      handleUpdateTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  const handleDiscard = () => {
    setEditingTaskId(null);
    setShowSaveModal(false);
  };

  return (
    <section className="tasks-container">
      {editingTaskId && (
        <div className="edit-modal">
          <button className="close-button" onClick={handleCloseEdit}>
            X
          </button>
          <textarea
            className="edit-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="save-modal-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleDiscard}>Discard</button>
          </div>
        </div>
      )}
      {!editingTaskId && (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <span className="date">{formatDate(task.date)}</span>
              <div className="task-content">
                <p>{task.content}</p>
                <div className="task-actions">
                  <button className="icon-button" onClick={() => handleEdit(task.id)}>
                    <img src={editIcon} alt="Edit" />
                  </button>
                  <button className="icon-button" onClick={() => handleDelete(task.id)}>
                    <img src={deleteIcon} alt="Delete" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export default Tasks;
