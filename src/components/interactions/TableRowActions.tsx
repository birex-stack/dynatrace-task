import { MoreVertical } from 'lucide-react';
import { QuickCaptureButton } from './QuickCaptureButton';
import './TableRowActions.css';

interface TableRowActionsProps {
  onKebabClick: (anchor: { x: number; y: number }) => void;
  onAddObservation?: () => void;
}

export function TableRowActions({
  onKebabClick,
  onAddObservation,
}: TableRowActionsProps) {
  return (
    <td className="table-row-actions">
      <div className="table-row-actions__inner">
        {onAddObservation && (
          <QuickCaptureButton
            label="Add observation"
            onClick={onAddObservation}
          />
        )}
        <button
          type="button"
          className="table-row-actions__kebab"
          aria-label="More actions"
          onClick={(e) => {
            e.stopPropagation();
            onKebabClick({ x: e.clientX, y: e.clientY });
          }}
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>
      </div>
    </td>
  );
}
