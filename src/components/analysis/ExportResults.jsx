import { topsis } from '../../lib/topsis';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);

const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const TableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
    </svg>
);

/**
 * Generate CSV content from analysis results
 */
function generateCSV(positionName, results, candidates, attributes) {
    const topsisResult = topsis(candidates, attributes);
    const { normalizedMatrix, weightedMatrix, idealBest, idealWorst } = topsisResult;

    // Build candidate index map
    const candidateIndexMap = {};
    candidates.forEach((c, i) => { candidateIndexMap[c._id] = i; });

    const lines = [];

    // Header section
    lines.push(`TOPSIS Analysis Report`);
    lines.push(`Position: ${positionName}`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push(`Candidates: ${candidates.length}`);
    lines.push(`Attributes: ${attributes.length}`);
    lines.push('');

    // Rankings section
    lines.push('=== RANKINGS ===');
    const rankHeaders = ['Rank', 'Candidate', 'Closeness Score (%)', 'Distance to Best', 'Distance to Worst'];
    lines.push(rankHeaders.join(','));

    results.forEach(r => {
        lines.push([
            r.rank,
            `"${r.candidateName}"`,
            (r.closenessScore * 100).toFixed(1),
            r.distanceToBest.toFixed(4),
            r.distanceToWorst.toFixed(4),
        ].join(','));
    });
    lines.push('');

    // Raw values section
    lines.push('=== RAW VALUES ===');
    const rawHeaders = ['Candidate', ...attributes.map(a => `"${a.name}"`)];
    lines.push(rawHeaders.join(','));

    results.forEach(r => {
        const cidx = candidateIndexMap[r.candidateId];
        const candidate = candidates[cidx];
        if (!candidate) return;
        const values = attributes.map(attr => {
            const dp = candidate.data.find(d => d.attributeName === attr.name);
            return dp ? dp.value : 0;
        });
        lines.push([`"${r.candidateName}"`, ...values].join(','));
    });
    lines.push('');

    // Normalized values section
    lines.push('=== NORMALIZED VALUES ===');
    const normHeaders = ['Candidate', ...attributes.map(a => `"${a.name}"`)];
    lines.push(normHeaders.join(','));

    results.forEach(r => {
        const cidx = candidateIndexMap[r.candidateId];
        if (cidx === undefined) return;
        const values = attributes.map((_, attrIdx) =>
            (normalizedMatrix[cidx]?.[attrIdx] ?? 0).toFixed(4)
        );
        lines.push([`"${r.candidateName}"`, ...values].join(','));
    });
    lines.push('');

    // Weighted values section
    lines.push('=== WEIGHTED NORMALIZED VALUES ===');
    const wHeaders = ['Candidate', ...attributes.map(a => `"${a.name} (w=${a.weight})"`)];
    lines.push(wHeaders.join(','));

    results.forEach(r => {
        const cidx = candidateIndexMap[r.candidateId];
        if (cidx === undefined) return;
        const values = attributes.map((_, attrIdx) =>
            (weightedMatrix[cidx]?.[attrIdx] ?? 0).toFixed(4)
        );
        lines.push([`"${r.candidateName}"`, ...values].join(','));
    });
    lines.push('');

    // Ideal solutions
    lines.push('=== IDEAL SOLUTIONS ===');
    lines.push(['', ...attributes.map(a => `"${a.name}"`)].join(','));
    lines.push(['Ideal Best (A+)', ...idealBest.map(v => v.toFixed(4))].join(','));
    lines.push(['Ideal Worst (A-)', ...idealWorst.map(v => v.toFixed(4))].join(','));
    lines.push('');

    // Attribute config
    lines.push('=== ATTRIBUTE CONFIGURATION ===');
    lines.push(['Attribute', 'Weight', 'Type', 'Beneficial'].join(','));
    attributes.forEach(a => {
        lines.push([
            `"${a.name}"`,
            a.weight,
            a.type,
            a.beneficial ? 'Yes' : 'No',
        ].join(','));
    });

    return lines.join('\n');
}

/**
 * Generate a printable HTML report for PDF export
 */
function generatePDFReport(positionName, results, candidates, attributes) {
    const topsisResult = topsis(candidates, attributes);
    const { normalizedMatrix, weightedMatrix, idealBest, idealWorst } = topsisResult;

    const candidateIndexMap = {};
    candidates.forEach((c, i) => { candidateIndexMap[c._id] = i; });

    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getScoreColor = (score) => {
        if (score >= 0.7) return '#22c55e';
        if (score >= 0.4) return '#f59e0b';
        return '#ef4444';
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TOPSIS Analysis - ${positionName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1f2937; background: #ffffff; padding: 2rem; line-height: 1.6;
        }
        h1, h2, h3 { color: #111827; }
        
        .report-header { 
            text-align: center; padding: 2rem; margin-bottom: 2rem;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white; border-radius: 12px;
        }
        .report-header h1 { font-size: 1.75rem; margin-bottom: 0.25rem; color: white; }
        .report-header p { opacity: 0.9; font-size: 0.875rem; }
        .report-meta { 
            display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;
            font-size: 0.8125rem; opacity: 0.85;
        }
        
        .section { margin-bottom: 2rem; page-break-inside: avoid; }
        .section-title { 
            font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;
            padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;
        }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.8125rem; }
        th { 
            background: #f9fafb; padding: 0.625rem 0.75rem; text-align: left; 
            font-weight: 600; font-size: 0.75rem; text-transform: uppercase;
            letter-spacing: 0.02em; color: #6b7280; border-bottom: 2px solid #e5e7eb;
        }
        td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
        tr:nth-child(even) td { background: #fafafa; }
        
        .winner-row td { background: rgba(79, 70, 229, 0.06) !important; font-weight: 600; }
        .medal { font-size: 1.25rem; }
        .score { font-weight: 700; }
        .mono { font-family: 'Courier New', monospace; font-size: 0.75rem; }
        
        .ideal-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .ideal-card { 
            flex: 1; padding: 1rem; border-radius: 8px; border: 1px solid;
        }
        .ideal-best { background: #f0fdf4; border-color: #bbf7d0; }
        .ideal-worst { background: #fef2f2; border-color: #fecaca; }
        .ideal-card h4 { font-size: 0.875rem; margin-bottom: 0.5rem; }
        .ideal-best h4 { color: #16a34a; }
        .ideal-worst h4 { color: #dc2626; }
        .ideal-values { display: flex; flex-wrap: wrap; gap: 0.375rem; }
        .ideal-val { 
            display: inline-flex; align-items: center; gap: 0.25rem;
            padding: 0.125rem 0.5rem; background: white; border-radius: 4px;
            font-size: 0.6875rem; border: 1px solid #e5e7eb;
        }
        .ideal-val .label { color: #9ca3af; }
        .ideal-val .val { font-family: 'Courier New', monospace; font-weight: 600; }
        
        .footer { 
            margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
            text-align: center; font-size: 0.75rem; color: #9ca3af;
        }
        
        @media print { 
            body { padding: 0.5cm; }
            .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .winner-row td, th, tr:nth-child(even) td, .ideal-best, .ideal-worst { 
                -webkit-print-color-adjust: exact; print-color-adjust: exact; 
            }
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>TOPSIS Analysis Report</h1>
        <p>${positionName}</p>
        <div class="report-meta">
            <span>📅 ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>👥 ${candidates.length} Candidates</span>
            <span>📊 ${attributes.length} Attributes</span>
        </div>
    </div>

    <div class="section">
        <h3 class="section-title">🏆 Final Rankings</h3>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Closeness Score</th>
                    <th>D+ (to Best)</th>
                    <th>D− (to Worst)</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(r => `
                <tr class="${r.rank === 1 ? 'winner-row' : ''}">
                    <td><span class="medal">${getRankMedal(r.rank)}</span></td>
                    <td>${r.candidateName}</td>
                    <td class="score" style="color:${getScoreColor(r.closenessScore)}">${(r.closenessScore * 100).toFixed(1)}%</td>
                    <td class="mono">${r.distanceToBest.toFixed(4)}</td>
                    <td class="mono">${r.distanceToWorst.toFixed(4)}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3 class="section-title">📋 Raw Candidate Values</h3>
        <table>
            <thead>
                <tr>
                    <th>Candidate</th>
                    ${attributes.map(a => `<th>${a.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${results.map(r => {
        const cidx = candidateIndexMap[r.candidateId];
        const candidate = candidates[cidx];
        if (!candidate) return '';
        return `<tr>
                        <td><strong>${r.candidateName}</strong></td>
                        ${attributes.map(attr => {
            const dp = candidate.data.find(d => d.attributeName === attr.name);
            return `<td>${dp ? dp.value : 'N/A'}</td>`;
        }).join('')}
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3 class="section-title">📐 Weighted Normalized Values</h3>
        <table>
            <thead>
                <tr>
                    <th>Candidate</th>
                    ${attributes.map(a => `<th>${a.name} (w=${a.weight})</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${results.map(r => {
        const cidx = candidateIndexMap[r.candidateId];
        if (cidx === undefined) return '';
        return `<tr>
                        <td><strong>${r.candidateName}</strong></td>
                        ${attributes.map((_, attrIdx) => {
            const val = weightedMatrix[cidx]?.[attrIdx] ?? 0;
            return `<td class="mono">${val.toFixed(4)}</td>`;
        }).join('')}
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3 class="section-title">⭐ Ideal Solutions</h3>
        <div class="ideal-row">
            <div class="ideal-card ideal-best">
                <h4>Ideal Best (A+)</h4>
                <div class="ideal-values">
                    ${attributes.map((attr, i) => `
                        <span class="ideal-val">
                            <span class="label">${attr.name}:</span>
                            <span class="val">${idealBest[i]?.toFixed(4)}</span>
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="ideal-card ideal-worst">
                <h4>Ideal Worst (A−)</h4>
                <div class="ideal-values">
                    ${attributes.map((attr, i) => `
                        <span class="ideal-val">
                            <span class="label">${attr.name}:</span>
                            <span class="val">${idealWorst[i]?.toFixed(4)}</span>
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3 class="section-title">⚙️ Attribute Configuration</h3>
        <table>
            <thead>
                <tr>
                    <th>Attribute</th>
                    <th>Weight</th>
                    <th>Type</th>
                    <th>Direction</th>
                </tr>
            </thead>
            <tbody>
                ${attributes.map(a => `
                <tr>
                    <td><strong>${a.name}</strong></td>
                    <td>${(a.weight * 100).toFixed(0)}%</td>
                    <td>${a.type}</td>
                    <td>${a.beneficial ? '↑ Beneficial (higher is better)' : '↓ Cost (lower is better)'}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3 class="section-title">📖 About TOPSIS</h3>
        <p style="font-size: 0.875rem; color: #4b5563; line-height: 1.8;">
            <strong>TOPSIS</strong> (Technique for Order of Preference by Similarity to Ideal Solution) is a multi-criteria 
            decision analysis method. It ranks alternatives based on their geometric distance from the ideal best (A+) and 
            ideal worst (A−) solutions. The closeness score is calculated as: <code>Score = D− / (D+ + D−)</code>, where a 
            higher score indicates a candidate closer to the ideal solution.
        </p>
    </div>

    <div class="footer">
        <p>Generated by TOPSIS Recruitment Platform • ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
}

/**
 * Download a file with given content
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * ExportResults - Export TOPSIS results as CSV or PDF
 */
function ExportResults({ positionName, results, candidates, attributes }) {
    if (!results || results.length === 0) return null;

    const sanitizedName = positionName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10);

    const handleExportCSV = () => {
        const csv = generateCSV(positionName, results, candidates, attributes);
        downloadFile(csv, `topsis_${sanitizedName}_${dateStr}.csv`, 'text/csv;charset=utf-8');
    };

    const handleExportPDF = () => {
        const html = generatePDFReport(positionName, results, candidates, attributes);
        // Open in a new window for printing/saving as PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            // Trigger print dialog after a short delay to let styles load
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    return (
        <div className="export-section">
            <h3 className="export-title">💾 Export Results</h3>
            <p className="export-description">Download the complete analysis report with all intermediate calculations.</p>
            <div className="export-buttons">
                <button className="export-btn export-csv" onClick={handleExportCSV}>
                    <TableIcon />
                    <span className="export-btn-text">
                        <strong>Export CSV</strong>
                        <span>Spreadsheet-ready data</span>
                    </span>
                    <DownloadIcon />
                </button>
                <button className="export-btn export-pdf" onClick={handleExportPDF}>
                    <FileTextIcon />
                    <span className="export-btn-text">
                        <strong>Export PDF</strong>
                        <span>Printable report</span>
                    </span>
                    <DownloadIcon />
                </button>
            </div>

            <style>{`
                .export-section {
                    margin-top: 2rem;
                    animation: slideUp 0.5s ease-out;
                }

                .export-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .export-description {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 1.25rem;
                }

                .export-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .export-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    color: var(--text-primary);
                    text-align: left;
                }

                .export-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .export-btn:active {
                    transform: translateY(0);
                }

                .export-csv:hover { 
                    border-color: #22c55e; 
                    background: rgba(34, 197, 94, 0.08);
                }

                .export-csv svg:first-child {
                    color: #22c55e;
                }

                .export-pdf:hover { 
                    border-color: #ef4444; 
                    background: rgba(239, 68, 68, 0.08);
                }

                .export-pdf svg:first-child {
                    color: #ef4444;
                }

                .export-btn-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }

                .export-btn-text strong {
                    font-size: 0.9375rem;
                    font-weight: 600;
                }

                .export-btn-text span {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .export-btn svg:last-child {
                    color: var(--text-muted);
                    opacity: 0;
                    transition: opacity var(--transition-fast);
                }

                .export-btn:hover svg:last-child {
                    opacity: 1;
                }

                @media (max-width: 600px) {
                    .export-buttons {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default ExportResults;
