import { SERVICES, type ServiceRow } from '../../data/mockData';
import { QuickCaptureButton } from '../interactions/QuickCaptureButton';
import './ServicesTable.css';

interface ServicesTableProps {
  onPaymentRowClick: (anchor: { x: number; y: number }) => void;
  onQuickCapture?: () => void;
}

export function ServicesTable({
  onPaymentRowClick,
  onQuickCapture,
}: ServicesTableProps) {
  return (
    <section className="services-table">
      <div className="services-table__header has-quick-capture">
        <h2 className="services-table__title">Services</h2>
        {onQuickCapture && (
          <QuickCaptureButton
            label="Add table as observation"
            onClick={onQuickCapture}
          />
        )}
      </div>
      <div className="services-table__scroll">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Version</th>
              <th>P95 latency</th>
              <th>Error rate</th>
              <th>Throughput</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((row) => (
              <ServiceTableRow
                key={row.id}
                row={row}
                onPaymentRowClick={onPaymentRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ServiceTableRow({
  row,
  onPaymentRowClick,
}: {
  row: ServiceRow;
  onPaymentRowClick: (anchor: { x: number; y: number }) => void;
}) {
  const highlighted = Boolean(row.highlighted);

  return (
    <tr
      className={highlighted ? 'is-highlighted' : undefined}
      onClick={(e) => {
        if (!highlighted) return;
        onPaymentRowClick({ x: e.clientX, y: e.clientY });
      }}
      style={highlighted ? { cursor: 'pointer' } : undefined}
    >
      <td>
        <span className="service-name">
          {highlighted && <span className="service-name__mark" aria-hidden />}
          {row.name}
        </span>
      </td>
      <td>{row.version}</td>
      <td className="is-numeric">{row.p95Ms} ms</td>
      <td className="is-numeric">{row.errorRate}</td>
      <td className="is-numeric">{row.throughput}</td>
      <td className={`is-numeric change change--${row.changeTone}`}>{row.change}</td>
    </tr>
  );
}
