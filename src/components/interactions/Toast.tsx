import { useEffect } from 'react';
import { Check } from 'lucide-react';
import './Toast.css';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, onDismiss, durationMs = 3200 }: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [onDismiss, durationMs]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden>
        <Check size={14} strokeWidth={2.2} />
      </span>
      <span className="toast__message">{message}</span>
    </div>
  );
}
