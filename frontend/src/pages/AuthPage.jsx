import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      if (mode === 'register') {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }

      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <p className="eyebrow">Authentication</p>
        <h1>{mode === 'register' ? 'Create your workspace account' : 'Welcome back'}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          {error ? <div className="notice-card">{error}</div> : null}

          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? 'Working...' : mode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>

        <p className="muted-copy">
          {mode === 'register' ? (
            <>
              Already have an account? <Link to="/login">Login</Link>.
            </>
          ) : (
            <>
              Need an account? <Link to="/register">Register</Link>.
            </>
          )}
        </p>
      </div>
    </section>
  );
}

export default AuthPage;