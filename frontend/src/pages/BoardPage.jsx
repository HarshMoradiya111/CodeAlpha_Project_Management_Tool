import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { createSocket } from '../socket';

const statusColumns = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

function BoardPage() {
  const { id } = useParams();
  const { token, user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let active = true;
    let socket;

    async function loadBoard() {
      try {
        setLoading(true);
        const [projectData, tasksData] = await Promise.all([
          apiRequest(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          apiRequest(`/api/tasks/project/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (active) {
          setProject(projectData);
          setMembers(projectData.members || []);
          setTasks(tasksData);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadBoard();
    }

    if (isAuthenticated && token) {
      socket = createSocket(token);
      socket.on('connect', () => {
        socket.emit('join-room', id);
      });

      socket.on('task-created', (payload) => {
        setTasks((currentTasks) => [payload.task, ...currentTasks]);
      });

      socket.on('task-updated', (payload) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === payload.task.id ? payload.task : task))
        );
      });

      socket.on('task-deleted', (payload) => {
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== payload.taskId));
        setSelectedTask((currentTask) => (currentTask?.id === payload.taskId ? null : currentTask));
      });

      socket.on('comment-created', (payload) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === payload.taskId
              ? { ...task, comments: [...task.comments, payload.comment] }
              : task
          )
        );

        setTaskComments((currentComments) =>
          selectedTask?.id === payload.taskId ? [...currentComments, payload.comment] : currentComments
        );
      });
    }

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [id, isAuthenticated, token, selectedTask?.id]);

  const columns = useMemo(
    () =>
      statusColumns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.key),
      })),
    [tasks]
  );

  async function handleCreateTask(event) {
    event.preventDefault();

    try {
      const createdTask = await apiRequest(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newTask,
          assignee: newTask.assignee || null,
        }),
      });

      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setNewTask({ title: '', description: '', assignee: '' });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleInvite(event) {
    event.preventDefault();

    try {
      const response = await apiRequest(`/api/projects/${id}/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail }),
      });

      setProject(response.project);
      setInviteEmail('');
      const updatedProject = await apiRequest(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(updatedProject.members || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function openTask(task) {
    setSelectedTask(task);
    setCommentText('');

    apiRequest(`/api/tasks/${task.id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setTaskComments)
      .catch((requestError) => setError(requestError.message));
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    try {
      const createdComment = await apiRequest(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentText }),
      });

      setTaskComments((currentComments) => [...currentComments, createdComment]);
      setCommentText('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDrop(task, status) {
    try {
      const updatedTask = await apiRequest(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });

      setTasks((currentTasks) => currentTasks.map((item) => (item.id === task.id ? updatedTask : item)));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!isAuthenticated) {
    return <div className="notice-card empty-state">Log in to manage project boards.</div>;
  }

  if (loading) {
    return <div className="notice-card">Loading board...</div>;
  }

  if (!project) {
    return <div className="notice-card">Project not found.</div>;
  }

  return (
    <>
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">Project board</p>
          <h1>{project.name}</h1>
          <p className="intro">Drag cards between columns, open task details, and keep the board moving.</p>
        </div>
        <div className="hero-badges">
          <span className="status-pill">{members.length} members</span>
          <Link className="secondary-button" to="/">
            Back to projects
          </Link>
        </div>
      </section>

      <section className="board-tools">
        <form className="composer-card" onSubmit={handleCreateTask}>
          <p className="eyebrow">New task</p>
          <label>
            Title
            <input
              value={newTask.title}
              onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows="3"
              value={newTask.description}
              onChange={(event) => setNewTask({ ...newTask, description: event.target.value })}
            />
          </label>
          <label>
            Assignee email
            <input
              value={newTask.assignee}
              onChange={(event) => setNewTask({ ...newTask, assignee: event.target.value })}
              placeholder="optional"
            />
          </label>
          <button className="primary-button" type="submit">Create task</button>
        </form>

        <form className="composer-card" onSubmit={handleInvite}>
          <p className="eyebrow">Invite member</p>
          <label>
            Email
            <input
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="teammate@example.com"
              required
            />
          </label>
          <button className="secondary-button" type="submit">Send invite</button>
        </form>
      </section>

      {error ? <div className="notice-card">{error}</div> : null}

      <section className="board-grid">
        {columns.map((column) => (
          <article
            key={column.key}
            className="column-card"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
              handleDrop(payload, column.key);
            }}
          >
            <div className="column-header">
              <h2>{column.label}</h2>
              <span className="status-pill">{column.tasks.length}</span>
            </div>

            <div className="column-list">
              {column.tasks.map((task) => (
                <article
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', JSON.stringify(task))}
                  onClick={() => openTask(task)}
                >
                  <div className="task-top">
                    <h3>{task.title}</h3>
                    <span className="task-badge">{task.status}</span>
                  </div>
                  <p className="muted-copy">{task.description || 'No description yet.'}</p>
                  <div className="task-footer">
                    <span>{task.comments.length} comments</span>
                    <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </section>

      {selectedTask ? (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Task detail</p>
                <h2>{selectedTask.title}</h2>
              </div>
              <button className="secondary-button" type="button" onClick={() => setSelectedTask(null)}>
                Close
              </button>
            </div>

            <p className="muted-copy">{selectedTask.description || 'No description yet.'}</p>

            <div className="modal-meta">
              <span className="status-pill">{selectedTask.status}</span>
              <span>{selectedTask.assignee ? selectedTask.assignee.name : 'Unassigned'}</span>
            </div>

            <form className="composer-grid" onSubmit={handleCommentSubmit}>
              <textarea
                rows="3"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
              />
              <button className="primary-button" type="submit">Add comment</button>
            </form>

            <div className="comment-list">
              {taskComments.length ? (
                taskComments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <strong>{comment.user?.name || 'Member'}</strong>
                    <p className="muted-copy">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="notice-card empty-state">No comments yet.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default BoardPage;