import { NotebookPlusIcon } from '../icons/NotebookPlusIcon';
import './QuickCaptureButton.css';

interface QuickCaptureButtonProps {
  label?: string;
  onClick: () => void;
}

export function QuickCaptureButton({
  label = 'Add observation',
  onClick,
}: QuickCaptureButtonProps) {
  return (
    <button
      type="button"
      className="quick-capture"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <NotebookPlusIcon size={16} strokeWidth={1.7} />
    </button>
  );
}
