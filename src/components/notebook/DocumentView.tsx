import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DOCUMENT_SECTIONS,
  type DocumentChartPoint,
  type DocumentSection,
  type DocumentTableData,
} from '../../data/notebookData';
import './DocumentView.css';

interface DocumentViewProps {
  onViewInvestigation: () => void;
}

function formatRichText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function DocumentView({ onViewInvestigation }: DocumentViewProps) {
  return (
    <div className="document-view">
      <div className="document-banner">
        <div className="document-banner__title">Investigation state available</div>
        <div className="document-banner__sub">
          The team built shared context here and is working the case together with AI agents.
        </div>
        <button type="button" className="document-banner__cta" onClick={onViewInvestigation}>
          View Investigation record
        </button>
      </div>

      <div className="document-sections">
        {DOCUMENT_SECTIONS.map((section) => (
          <DocumentBlock key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function DocumentBlock({ section }: { section: DocumentSection }) {
  return (
    <article className={`doc-block doc-block--${section.type}`}>
      <div className="doc-block__type">{section.title}</div>

      {section.type === 'markdown' && (
        <>
          <div
            className="doc-block__body"
            dangerouslySetInnerHTML={{ __html: formatRichText(section.body) }}
          />
          {section.chips && section.chips.length > 0 && (
            <div className="doc-chips">
              {section.chips.map((chip) => (
                <span key={chip} className="doc-chip">
                  {chip}
                </span>
              ))}
            </div>
          )}
          {section.bullets && <BulletList items={section.bullets} />}
        </>
      )}

      {section.type === 'prompt' && (
        <div className="doc-block__prompt">{section.body}</div>
      )}

      {section.type === 'kpi' && (
        <div className="doc-kpi-grid">
          {section.items.map((item) => (
            <div key={item.label} className="doc-kpi">
              <div className="doc-kpi__label">{item.label}</div>
              <div className="doc-kpi__value">{item.value}</div>
              {item.delta && (
                <div className={`doc-kpi__delta is-${item.tone ?? 'neutral'}`}>
                  {item.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section.type === 'dql' && (
        <>
          <pre className="doc-block__code">{section.query}</pre>
          {section.result && (
            <div
              className="doc-block__result"
              dangerouslySetInnerHTML={{ __html: formatRichText(section.result) }}
            />
          )}
          {section.table && <DocTable table={section.table} />}
        </>
      )}

      {section.type === 'chart' && (
        <DocChart
          data={section.data}
          series={section.series}
          yLabel={section.yLabel}
          markerTime={section.markerTime}
          caption={section.caption}
        />
      )}

      {section.type === 'table' && (
        <>
          <DocTable table={section.table} />
          {section.caption && (
            <div className="doc-block__caption">{section.caption}</div>
          )}
        </>
      )}

      {section.type === 'result' && (
        <>
          <div
            className="doc-block__result doc-block__result--emphasis"
            dangerouslySetInnerHTML={{ __html: formatRichText(section.body) }}
          />
          {section.bullets && <BulletList items={section.bullets} />}
        </>
      )}
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="doc-bullets">
      {items.map((item) => (
        <li
          key={item}
          dangerouslySetInnerHTML={{ __html: formatRichText(item) }}
        />
      ))}
    </ul>
  );
}

function DocTable({ table }: { table: DocumentTableData }) {
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={`${row[0]}-${rowIndex}`}
              className={
                table.highlightRow === rowIndex ? 'is-highlight' : undefined
              }
            >
              {row.map((cell, cellIndex) => (
                <td key={`${table.columns[cellIndex]}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocChart({
  data,
  series,
  yLabel,
  markerTime,
  caption,
}: {
  data: DocumentChartPoint[];
  series: { key: string; label: string; color: string }[];
  yLabel: string;
  markerTime?: string;
  caption: string;
}) {
  return (
    <div className="doc-chart">
      <div className="doc-chart__canvas">
        <ResponsiveContainer width="100%" height={248}>
          <LineChart data={data} margin={{ top: 18, right: 16, left: 4, bottom: 12 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              width={48}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 8,
                style: { fill: 'var(--text-muted)', fontSize: 10 },
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(20, 28, 40, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.055)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--text)',
                backdropFilter: 'blur(16px) saturate(130%)',
                WebkitBackdropFilter: 'blur(16px) saturate(130%)',
                boxShadow: 'var(--glass-shadow)',
              }}
            />
            {markerTime && (
              <ReferenceLine
                x={markerTime}
                stroke="var(--chart-marker)"
                strokeDasharray="4 3"
                label={{
                  value: 'Deploy',
                  position: 'insideTopLeft',
                  fill: 'var(--text-muted)',
                  fontSize: 10,
                }}
              />
            )}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={s.key === 'max' ? 1.5 : 2}
                strokeDasharray={s.key === 'max' ? '4 3' : undefined}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="doc-chart__legend" aria-hidden>
          {series.map((s) => (
            <span key={s.key} className="doc-chart__legend-item">
              <i
                className={`doc-chart__legend-swatch${s.key === 'max' ? ' is-dashed' : ''}`}
                style={{
                  background: s.key === 'max' ? 'transparent' : s.color,
                  borderColor: s.color,
                }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="doc-block__caption">{caption}</div>
    </div>
  );
}
