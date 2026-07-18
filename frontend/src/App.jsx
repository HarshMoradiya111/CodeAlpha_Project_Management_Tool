const highlights = [
  'Projects, members, tasks, and comments',
  'JWT auth and project membership checks',
  'MongoDB schemas for boards and cards',
  'Kanban board UI and drag-and-drop in later phases',
];

function App() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">CodeAlpha Internship</p>
        <h1>CodeAlpha Project Management Tool</h1>
        <p className="intro">
          Phase 1 scaffold is ready. The repo is split into backend and frontend
          folders so the next phases can focus on board logic, task assignment,
          and collaboration workflows.
        </p>
        <div className="status-row">
          <span className="status-pill">Phase 1 complete</span>
          <span className="status-note">Waiting for your confirmation before Phase 2</span>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Backend</h2>
          <p>Express server with MongoDB connection wiring and a health endpoint.</p>
        </article>
        <article className="info-card">
          <h2>Frontend</h2>
          <p>React + Vite starter prepared for project boards and task views.</p>
        </article>
        <article className="info-card">
          <h2>Next work</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default App;
