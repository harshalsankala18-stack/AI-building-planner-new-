import React, { useState, useEffect } from 'react';
import { ArgonStudioShell } from './components/argon/ArgonStudioShell';
import { LoginPage } from './pages/LoginPage';
import { ProjectHubPage } from './pages/ProjectHubPage';
import { authService, type AuthSession } from './services/auth-service';
import { projectStorage } from './services/storage';
import './styles/editor.css';
import './styles/studio.css';
import './styles/argon.css';
import './styles/aether-concept.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class StudioErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ARGON Studio render error:', error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans"
        >
          <div className="max-w-lg rounded-xl border border-rose-500/40 bg-slate-900 p-6 shadow-xl">
            <h1 className="text-base font-bold text-rose-300">Workspace Rendering Error</h1>
            <p className="mt-2 text-xs text-slate-300">{this.state.error.message}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400"
              >
                Retry Render
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Reload Studio
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  useEffect(() => {
    const unsub = authService.subscribe((s) => setSession(s));

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 1. Unauthenticated sessions: always show LoginPage cleanly with zero studio chrome
  if (!session) {
    return (
      <StudioErrorBoundary>
        <LoginPage
          onSuccess={() => {
            navigate('/projects');
          }}
        />
      </StudioErrorBoundary>
    );
  }

  // 2. Authenticated sessions:
  // If at /login while logged in, redirect to /projects
  if (currentPath === '/login') {
    navigate('/projects');
    return null;
  }

  // If at /projects, render the ProjectHubPage
  if (currentPath === '/projects') {
    return (
      <StudioErrorBoundary>
        <ProjectHubPage
          onOpenProject={(projectId) => {
            projectStorage.setActiveProjectId(projectId);
            navigate('/studio');
          }}
          onNewProject={() => {
            navigate('/projects/new');
          }}
          onSignOut={async () => {
            await authService.logout();
            navigate('/login');
          }}
        />
      </StudioErrorBoundary>
    );
  }

  // If at /projects/new, open Studio in Setup Wizard mode
  if (currentPath === '/projects/new') {
    return (
      <StudioErrorBoundary>
        <ArgonStudioShell
          initialWorkspace="setup"
          onBackToProjects={() => navigate('/projects')}
        />
      </StudioErrorBoundary>
    );
  }

  // Studio workspace (at /studio or /)
  return (
    <StudioErrorBoundary>
      <ArgonStudioShell
        initialWorkspace="studio"
        onBackToProjects={() => navigate('/projects')}
      />
    </StudioErrorBoundary>
  );
};

export default App;
