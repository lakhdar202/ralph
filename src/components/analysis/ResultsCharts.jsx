import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Cell
} from 'recharts';

// Color palette for candidates in charts
const CANDIDATE_COLORS = [
    '#6366f1', // Indigo (primary)
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f97316', // Orange
    '#8b5cf6', // Violet
];

/**
 * Bar Chart showing closeness scores for all candidates
 */
function ClosenessScoreChart({ results }) {
    const data = results.map((r, index) => ({
        name: r.candidateName,
        score: Math.round(r.closenessScore * 100 * 10) / 10, // Convert to percentage with 1 decimal
        fullName: r.candidateName,
        rank: r.rank,
        colorIndex: index
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="chart-tooltip">
                    <div className="tooltip-title">{item.fullName}</div>
                    <div className="tooltip-row">
                        <span>Rank:</span>
                        <strong>#{item.rank}</strong>
                    </div>
                    <div className="tooltip-row">
                        <span>Closeness Score:</span>
                        <strong style={{ color: '#22c55e' }}>{item.score}%</strong>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <h4 className="chart-title">📊 Closeness Score Comparison</h4>
            <p className="chart-description">Higher scores indicate candidates closer to the ideal solution</p>
            <div className="chart-wrapper" style={{ height: Math.max(200, results.length * 50 + 50) }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#e5e7eb', fontSize: 13, fontWeight: 500 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar
                            dataKey="score"
                            radius={[0, 6, 6, 0]}
                            barSize={30}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={CANDIDATE_COLORS[index % CANDIDATE_COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * Radar Chart for multi-attribute candidate comparison
 * Shows each candidate's raw values across all attributes
 */
function AttributeRadarChart({ candidates, attributes }) {
    if (!candidates || candidates.length === 0 || !attributes || attributes.length === 0) {
        return null;
    }

    // Find min/max for each attribute to normalize for visualization
    const attrRanges = attributes.map(attr => {
        const values = candidates.map(c => {
            const dp = c.data.find(d => d.attributeName === attr.name);
            return dp ? dp.value : 0;
        });
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max, range: max - min || 1 };
    });

    // Build radar data: one object per attribute with candidate values normalized to 0-100
    const radarData = attributes.map((attr, attrIdx) => {
        const dataPoint = {
            attribute: attr.name,
            fullMark: 100,
        };

        candidates.forEach((candidate, candIdx) => {
            const dp = candidate.data.find(d => d.attributeName === attr.name);
            const rawValue = dp ? dp.value : 0;
            // Normalize to 0-100 scale for visualization
            const normalized = ((rawValue - attrRanges[attrIdx].min) / attrRanges[attrIdx].range) * 100;
            dataPoint[`candidate_${candIdx}`] = Math.round(normalized * 10) / 10;
            dataPoint[`raw_${candIdx}`] = rawValue;
        });

        return dataPoint;
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <div className="tooltip-title">{payload[0].payload.attribute}</div>
                    {payload.map((item, idx) => {
                        const candIdx = parseInt(item.dataKey.split('_')[1]);
                        const rawValue = item.payload[`raw_${candIdx}`];
                        return (
                            <div key={idx} className="tooltip-row">
                                <span style={{ color: item.color }}>{candidates[candIdx].name}:</span>
                                <strong>{rawValue}</strong>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <h4 className="chart-title">🎯 Candidate Attribute Profiles</h4>
            <p className="chart-description">Compare how candidates perform across different attributes (normalized scale)</p>
            <div className="chart-wrapper radar-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis
                            dataKey="attribute"
                            tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }}
                            tickLine={false}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            tickCount={5}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value, entry) => {
                                const candIdx = parseInt(value.split('_')[1]);
                                return <span style={{ color: '#e5e7eb' }}>{candidates[candIdx].name}</span>;
                            }}
                        />
                        {candidates.slice(0, 5).map((candidate, idx) => (
                            <Radar
                                key={candidate._id}
                                name={`candidate_${idx}`}
                                dataKey={`candidate_${idx}`}
                                stroke={CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length]}
                                fill={CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length]}
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            {candidates.length > 5 && (
                <p className="chart-note">* Showing top 5 candidates for clarity</p>
            )}
        </div>
    );
}

/**
 * Combined results charts component
 */
function ResultsCharts({ results, candidates, attributes }) {
    return (
        <div className="results-charts">
            <h3 className="charts-section-title">📈 Visual Analysis</h3>
            <div className="charts-grid">
                <ClosenessScoreChart results={results} />
                <AttributeRadarChart candidates={candidates} attributes={attributes} />
            </div>

            <style>{`
                .results-charts {
                    margin-top: 2rem;
                    animation: slideUp 0.5s ease-out;
                }

                .charts-section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .chart-container {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: 1.5rem;
                    transition: all var(--transition-fast);
                }

                .chart-container:hover {
                    border-color: var(--color-primary-500);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
                }

                .chart-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem 0;
                }

                .chart-description {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    margin: 0 0 1rem 0;
                }

                .chart-wrapper {
                    min-height: 200px;
                }

                .radar-wrapper {
                    min-height: 350px;
                }

                .chart-note {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.75rem;
                    font-style: italic;
                    text-align: center;
                }

                .chart-tooltip {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 0.75rem 1rem;
                    box-shadow: var(--shadow-lg);
                    min-width: 160px;
                }

                .tooltip-title {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .tooltip-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.8125rem;
                    padding: 0.25rem 0;
                }

                .tooltip-row span {
                    color: var(--text-secondary);
                }

                .tooltip-row strong {
                    color: var(--text-primary);
                }

                @media (max-width: 900px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default ResultsCharts;
