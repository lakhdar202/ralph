import { useState } from 'react';
import { topsis } from '../../lib/topsis';

// Color palette matching the charts
const CANDIDATE_COLORS = [
    '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b',
    '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6',
];

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const ChevronUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
    </svg>
);

/**
 * ScoreBreakdown - Detailed per-candidate breakdown of TOPSIS analysis
 * 
 * Shows for each candidate:
 * - Raw input values per attribute
 * - Normalized values (after vector normalization)
 * - Weighted normalized values
 * - Distance contribution per attribute to ideal best & worst
 * - Visual comparison bar showing how each attribute contributes to the final score
 */
function ScoreBreakdown({ results, candidates, attributes }) {
    const [expandedCandidate, setExpandedCandidate] = useState(null);

    if (!results || results.length === 0 || !candidates || candidates.length < 2 || !attributes || attributes.length === 0) {
        return null;
    }

    // Re-compute TOPSIS to get intermediate matrix data
    const topsisResult = topsis(candidates, attributes);
    const { normalizedMatrix, weightedMatrix, idealBest, idealWorst } = topsisResult;

    // Build a lookup: candidateId -> index in the topsis results (ordered same as candidates array)
    const candidateIndexMap = {};
    candidates.forEach((c, i) => {
        candidateIndexMap[c._id] = i;
    });

    const toggleCandidate = (candidateId) => {
        setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
    };

    const getScoreColor = (score) => {
        if (score >= 0.7) return '#22c55e';
        if (score >= 0.4) return '#f59e0b';
        return '#ef4444';
    };

    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="score-breakdown-section">
            <h3 className="breakdown-section-title">🔍 Score Breakdown Per Candidate</h3>
            <p className="breakdown-description">
                Click on a candidate to see how each attribute contributes to their final TOPSIS score.
            </p>

            <div className="breakdown-list">
                {results.map((result, resultIdx) => {
                    const candidateIdx = candidateIndexMap[result.candidateId];
                    const candidate = candidates[candidateIdx];
                    const isExpanded = expandedCandidate === result.candidateId;
                    const color = CANDIDATE_COLORS[resultIdx % CANDIDATE_COLORS.length];

                    if (candidateIdx === undefined || !candidate) return null;

                    return (
                        <div
                            key={result.candidateId}
                            className={`breakdown-card ${isExpanded ? 'expanded' : ''}`}
                            style={{ '--candidate-color': color }}
                        >
                            {/* Candidate header - clickable */}
                            <button
                                className="breakdown-header"
                                onClick={() => toggleCandidate(result.candidateId)}
                                aria-expanded={isExpanded}
                            >
                                <div className="breakdown-rank">
                                    <span className="breakdown-medal">{getRankMedal(result.rank)}</span>
                                </div>
                                <div className="breakdown-summary">
                                    <div className="breakdown-name">{result.candidateName}</div>
                                    <div className="breakdown-score-row">
                                        <div className="breakdown-mini-bar-wrap">
                                            <div
                                                className="breakdown-mini-bar"
                                                style={{
                                                    width: `${result.closenessScore * 100}%`,
                                                    backgroundColor: getScoreColor(result.closenessScore)
                                                }}
                                            />
                                        </div>
                                        <span className="breakdown-score-value" style={{ color: getScoreColor(result.closenessScore) }}>
                                            {(result.closenessScore * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="breakdown-distances">
                                    <span className="dist-label">
                                        D+ <span className="dist-val">{result.distanceToBest.toFixed(4)}</span>
                                    </span>
                                    <span className="dist-label">
                                        D− <span className="dist-val">{result.distanceToWorst.toFixed(4)}</span>
                                    </span>
                                </div>
                                <div className="breakdown-chevron">
                                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </div>
                            </button>

                            {/* Expanded detail view */}
                            {isExpanded && (
                                <div className="breakdown-detail">
                                    {/* Attribute breakdown table */}
                                    <div className="detail-table-wrap">
                                        <table className="detail-table">
                                            <thead>
                                                <tr>
                                                    <th>Attribute</th>
                                                    <th>Weight</th>
                                                    <th>Type</th>
                                                    <th>Raw Value</th>
                                                    <th>Normalized</th>
                                                    <th>Weighted</th>
                                                    <th>Ideal Best</th>
                                                    <th>Ideal Worst</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attributes.map((attr, attrIdx) => {
                                                    const rawVal = candidate.data.find(
                                                        d => d.attributeName === attr.name
                                                    )?.value ?? 0;
                                                    const normVal = normalizedMatrix[candidateIdx]?.[attrIdx] ?? 0;
                                                    const weightedVal = weightedMatrix[candidateIdx]?.[attrIdx] ?? 0;
                                                    const idealBestVal = idealBest[attrIdx] ?? 0;
                                                    const idealWorstVal = idealWorst[attrIdx] ?? 0;

                                                    // Calculate how close this attribute value is to ideal best (0-1)
                                                    const range = Math.abs(idealBestVal - idealWorstVal);
                                                    const closenessToIdeal = range > 0
                                                        ? 1 - (Math.abs(weightedVal - idealBestVal) / range)
                                                        : 1;

                                                    return (
                                                        <tr key={attr.name}>
                                                            <td className="attr-cell">
                                                                <span className="attr-name-text">{attr.name}</span>
                                                            </td>
                                                            <td className="weight-cell">
                                                                <span className="weight-badge">
                                                                    {(attr.weight * 100).toFixed(0)}%
                                                                </span>
                                                            </td>
                                                            <td className="type-cell">
                                                                <span className={`type-badge ${attr.beneficial ? 'beneficial' : 'cost'}`}>
                                                                    {attr.beneficial ? '↑ Benefit' : '↓ Cost'}
                                                                </span>
                                                            </td>
                                                            <td className="val-cell raw">{rawVal}</td>
                                                            <td className="val-cell">{normVal.toFixed(4)}</td>
                                                            <td className="val-cell weighted">{weightedVal.toFixed(4)}</td>
                                                            <td className="val-cell ideal-best-val">{idealBestVal.toFixed(4)}</td>
                                                            <td className="val-cell ideal-worst-val">{idealWorstVal.toFixed(4)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Visual attribute performance bars */}
                                    <div className="attr-performance">
                                        <h5 className="perf-title">Attribute Performance vs Ideal</h5>
                                        <div className="perf-bars">
                                            {attributes.map((attr, attrIdx) => {
                                                const weightedVal = weightedMatrix[candidateIdx]?.[attrIdx] ?? 0;
                                                const idealBestVal = idealBest[attrIdx] ?? 0;
                                                const idealWorstVal = idealWorst[attrIdx] ?? 0;

                                                const range = Math.abs(idealBestVal - idealWorstVal);
                                                const closeness = range > 0
                                                    ? Math.max(0, Math.min(1, 1 - (Math.abs(weightedVal - idealBestVal) / range)))
                                                    : 1;

                                                return (
                                                    <div key={attr.name} className="perf-bar-row">
                                                        <span className="perf-label">{attr.name}</span>
                                                        <div className="perf-bar-track">
                                                            <div
                                                                className="perf-bar-fill"
                                                                style={{
                                                                    width: `${closeness * 100}%`,
                                                                    backgroundColor: getScoreColor(closeness),
                                                                }}
                                                            />
                                                            <div
                                                                className="perf-bar-marker ideal-marker"
                                                                style={{ left: '100%' }}
                                                                title="Ideal Best"
                                                            />
                                                        </div>
                                                        <span className="perf-pct" style={{ color: getScoreColor(closeness) }}>
                                                            {(closeness * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Formula breakdown */}
                                    <div className="formula-section">
                                        <div className="formula-card">
                                            <span className="formula-label">Distance to Best (D+)</span>
                                            <span className="formula-value formula-best">{result.distanceToBest.toFixed(4)}</span>
                                        </div>
                                        <div className="formula-card">
                                            <span className="formula-label">Distance to Worst (D−)</span>
                                            <span className="formula-value formula-worst">{result.distanceToWorst.toFixed(4)}</span>
                                        </div>
                                        <div className="formula-card formula-result">
                                            <span className="formula-label">Closeness = D− / (D+ + D−)</span>
                                            <span className="formula-value formula-final" style={{ color: getScoreColor(result.closenessScore) }}>
                                                {(result.closenessScore * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .score-breakdown-section {
                    margin-top: 2rem;
                    animation: slideUp 0.5s ease-out;
                }

                .breakdown-section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .breakdown-description {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }

                .breakdown-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .breakdown-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    transition: all var(--transition-fast);
                    border-left: 3px solid var(--candidate-color);
                }

                .breakdown-card:hover {
                    border-color: var(--candidate-color);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.08);
                }

                .breakdown-card.expanded {
                    border-color: var(--candidate-color);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .breakdown-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    color: inherit;
                    transition: background var(--transition-fast);
                }

                .breakdown-header:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .breakdown-rank {
                    flex-shrink: 0;
                }

                .breakdown-medal {
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 36px;
                }

                .breakdown-summary {
                    flex: 1;
                    min-width: 0;
                }

                .breakdown-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.375rem;
                }

                .breakdown-score-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .breakdown-mini-bar-wrap {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 3px;
                    overflow: hidden;
                    max-width: 200px;
                }

                .breakdown-mini-bar {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s ease-out;
                }

                .breakdown-score-value {
                    font-size: 0.875rem;
                    font-weight: 700;
                    min-width: 50px;
                }

                .breakdown-distances {
                    display: flex;
                    gap: 1rem;
                    flex-shrink: 0;
                }

                .dist-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.125rem;
                }

                .dist-val {
                    font-size: 0.8125rem;
                    font-family: monospace;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .breakdown-chevron {
                    color: var(--text-muted);
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }

                .breakdown-detail {
                    padding: 0 1.25rem 1.25rem;
                    animation: expandDown 0.3s ease-out;
                }

                @keyframes expandDown {
                    from {
                        opacity: 0;
                        max-height: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        max-height: 1000px;
                        transform: translateY(0);
                    }
                }

                .detail-table-wrap {
                    overflow-x: auto;
                    margin-bottom: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                }

                .detail-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 700px;
                }

                .detail-table th {
                    text-align: left;
                    padding: 0.625rem 0.75rem;
                    font-size: 0.6875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid var(--border-color);
                    white-space: nowrap;
                }

                .detail-table td {
                    padding: 0.625rem 0.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    font-size: 0.8125rem;
                }

                .detail-table tr:last-child td {
                    border-bottom: none;
                }

                .detail-table tr:hover td {
                    background: rgba(255, 255, 255, 0.02);
                }

                .attr-cell {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .attr-name-text {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .weight-cell {
                    width: 70px;
                }

                .weight-badge {
                    display: inline-flex;
                    padding: 0.125rem 0.5rem;
                    background: rgba(99, 102, 241, 0.15);
                    color: var(--color-primary-400);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .type-cell {
                    width: 90px;
                }

                .type-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.125rem 0.5rem;
                    border-radius: var(--radius-full);
                    font-size: 0.6875rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .type-badge.beneficial {
                    background: rgba(34, 197, 94, 0.12);
                    color: var(--color-success-400);
                }

                .type-badge.cost {
                    background: rgba(239, 68, 68, 0.12);
                    color: var(--color-error-400);
                }

                .val-cell {
                    font-family: 'JetBrains Mono', monospace;
                    color: var(--text-secondary);
                    font-size: 0.8125rem;
                }

                .val-cell.raw {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .val-cell.weighted {
                    color: var(--color-primary-400);
                    font-weight: 500;
                }

                .val-cell.ideal-best-val {
                    color: var(--color-success-400);
                }

                .val-cell.ideal-worst-val {
                    color: var(--color-error-400);
                }

                /* Performance bars */
                .attr-performance {
                    margin-bottom: 1.5rem;
                }

                .perf-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }

                .perf-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .perf-bar-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .perf-label {
                    font-size: 0.8125rem;
                    color: var(--text-secondary);
                    min-width: 140px;
                    text-align: right;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .perf-bar-track {
                    flex: 1;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }

                .perf-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.6s ease-out;
                    position: relative;
                }

                .perf-pct {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    min-width: 42px;
                    text-align: right;
                }

                /* Formula section */
                .formula-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.5fr;
                    gap: 0.75rem;
                }

                .formula-card {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    text-align: center;
                }

                .formula-card.formula-result {
                    background: rgba(99, 102, 241, 0.08);
                    border-color: rgba(99, 102, 241, 0.2);
                }

                .formula-label {
                    font-size: 0.6875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .formula-value {
                    font-size: 1.125rem;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                    color: var(--text-primary);
                }

                .formula-best {
                    color: var(--color-success-400);
                }

                .formula-worst {
                    color: var(--color-error-400);
                }

                .formula-final {
                    font-size: 1.375rem;
                }

                @media (max-width: 768px) {
                    .breakdown-header {
                        flex-wrap: wrap;
                    }

                    .breakdown-distances {
                        width: 100%;
                        justify-content: flex-start;
                        padding-left: 3rem;
                    }

                    .formula-section {
                        grid-template-columns: 1fr;
                    }

                    .perf-label {
                        min-width: 80px;
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default ScoreBreakdown;
