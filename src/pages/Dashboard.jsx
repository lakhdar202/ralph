import { Link } from 'react-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Stat Card Component
function StatCard({ icon, label, value, trend, trendUp, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {trend && (
          <p className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <style>{`
        .stat-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--accent-color, var(--color-primary-500));
          opacity: 0.8;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-color-hover);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent-color, var(--color-primary-500)), var(--color-primary-700));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        
        .stat-trend {
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }
        
        .stat-trend.up {
          color: var(--color-success-400);
        }
        
        .stat-trend.down {
          color: var(--color-danger-400);
        }
      `}</style>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, description, to, color }) {
  return (
    <Link to={to} className="action-card" style={{ '--accent-color': color }}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h3 className="action-title">{title}</h3>
        <p className="action-description">{description}</p>
      </div>
      <div className="action-arrow">→</div>
      <style>{`
        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }
        
        .action-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, var(--accent-color, var(--color-primary-500)) 200%);
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        
        .action-card:hover {
          border-color: var(--accent-color, var(--color-primary-500));
          transform: translateX(4px);
        }
        
        .action-card:hover::before {
          opacity: 0.1;
        }
        
        .action-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--accent-color, var(--color-primary-500)), var(--color-primary-700));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        
        .action-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }
        
        .action-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .action-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .action-arrow {
          font-size: 1.25rem;
          color: var(--text-muted);
          transition: all var(--transition-fast);
          position: relative;
          z-index: 1;
        }
        
        .action-card:hover .action-arrow {
          color: var(--accent-color, var(--color-primary-400));
          transform: translateX(4px);
        }
      `}</style>
    </Link>
  );
}

// Icons
const PositionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CandidateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AnalysisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const TrendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

function Dashboard() {
  // Use Convex queries for real data
  const positions = useQuery(api.positions.list) || [];
  const candidateCount = useQuery(api.candidates.count) ?? 0;

  const stats = {
    positions: positions.length,
    candidates: candidateCount,
    analyses: 0,    // Will be updated in Milestone 4
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Welcome to <span className="gradient-text">TOPSIS Recruit</span>
          </h1>
          <p className="page-description">
            Make data-driven hiring decisions using the TOPSIS multi-criteria decision analysis method
          </p>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard
            icon={<PositionIcon />}
            label="Active Positions"
            value={stats.positions}
            color="var(--color-primary-500)"
          />
          <StatCard
            icon={<CandidateIcon />}
            label="Total Candidates"
            value={stats.candidates}
            color="var(--color-accent-500)"
          />
          <StatCard
            icon={<AnalysisIcon />}
            label="Analyses Run"
            value={stats.analyses}
            color="var(--color-warning-500)"
          />
          <StatCard
            icon={<TrendIcon />}
            label="Success Rate"
            value="—"
            color="var(--color-success-500)"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <QuickActionCard
            icon={<PlusIcon />}
            title="Create Position"
            description="Define a new job position with custom evaluation criteria"
            to="/positions"
            color="var(--color-primary-500)"
          />
          <QuickActionCard
            icon={<CandidateIcon />}
            title="Add Candidates"
            description="Enter candidate data for evaluation"
            to="/positions"
            color="var(--color-accent-500)"
          />
          <QuickActionCard
            icon={<RocketIcon />}
            title="Run Analysis"
            description="Execute TOPSIS algorithm and view rankings"
            to="/analysis"
            color="var(--color-warning-500)"
          />
        </div>
      </section>

      {/* Getting Started Guide */}
      <section className="guide-section">
        <div className="guide-card">
          <h2 className="guide-title">Getting Started</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Create a Position</h4>
                <p>Define the job role and set up custom evaluation attributes (skills, experience, etc.)</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Add Candidates</h4>
                <p>Enter candidate data with scores for each attribute you defined</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Set Weights</h4>
                <p>Assign importance weights to each attribute (must sum to 1.0)</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Run TOPSIS Analysis</h4>
                <p>Get objective, mathematically-grounded candidate rankings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles */}
      <style>{`
        .dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        .page-header {
          margin-bottom: 2.5rem;
          animation: slideDown 0.5s ease-out;
        }
        
        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        
        .page-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
        }
        
        .stats-section {
          margin-bottom: 3rem;
          animation: slideUp 0.5s ease-out 0.1s both;
        }
        
        .stats-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
        
        .actions-section {
          margin-bottom: 3rem;
          animation: slideUp 0.5s ease-out 0.2s both;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }
        
        .actions-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .guide-section {
          animation: slideUp 0.5s ease-out 0.3s both;
        }
        
        .guide-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2rem;
        }
        
        .guide-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        
        .steps {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .step {
          display: flex;
          gap: 1rem;
        }
        
        .step-number {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          color: white;
          flex-shrink: 0;
        }
        
        .step-content h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .step-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .dashboard {
            padding: 1.5rem;
          }
          
          .page-title {
            font-size: 1.75rem;
          }
          
          .steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
