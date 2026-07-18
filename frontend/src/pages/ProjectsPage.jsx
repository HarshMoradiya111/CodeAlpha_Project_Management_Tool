import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

function ProjectsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiRequest('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) {
          setProjects(data);
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

    loadProjects();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  async function handleCreateProject(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      const project = await apiRequest('/api/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });

      setProjects((currentProjects) => [project, ...currentProjects]);
      setName('');
      navigate(`/project/${project.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="notice-card empty-state">
        <p className="eyebrow">Workspace</p>
        <h1>Sign in to access your projects</h1>
        <Link className="primary-button" to="/login">
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Your boards, workspaces, and active tasks.</h1>
          <p className="intro">Create a project, invite members, and open the Kanban board to manage cards.</p>
        </div>
        <div className="hero-badges">
          <span className="status-pill">{projects.length} projects</span>
          <span className="status-pill">Signed in as {user?.name}</span>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="composer-card" onSubmit={handleCreateProject}>
          <p className="eyebrow">New project</p>
          <label>
            Project name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Product launch board" required />
          </label>
          {error ? <div className="notice-card">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create project'}
          </button>
        </form>

        <div className="projects-list">
          {loading ? <div className="notice-card">Loading projects...</div> : null}
          {!loading && !projects.length ? <div className="notice-card empty-state">No projects yet.</div> : null}

          {projects.map((project) => (
            <article key={project.id} className="project-card">
              <div>
                <p className="eyebrow">Workspace</p>
                <h2>{project.name}</h2>
                <p className="muted-copy">Members: {project.members.length}</p>
              </div>
              <Link className="secondary-button" to={`/project/${project.id}`}>
                Open board
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default ProjectsPage;