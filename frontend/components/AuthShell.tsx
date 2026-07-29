type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  showcaseTitle: string;
  showcaseText: string;
  children: React.ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  showcaseTitle,
  showcaseText,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-layout">
        <div className="auth-showcase">
          <div className="auth-brand">
            <span className="auth-brand-mark">LM</span>
            <span>Leave Manager</span>
          </div>

          <div className="auth-showcase-content">
            <h2>{showcaseTitle}</h2>
            <p>{showcaseText}</p>
          </div>

          <p className="auth-showcase-footer">
            A simple workspace for leave requests, approvals, and balances.
          </p>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <span className="auth-eyebrow">{eyebrow}</span>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
