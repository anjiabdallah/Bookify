import { useEffect, useState } from 'react';

type StatusAlertProps = {
  message?: string | null;
  variant?: 'success' | 'error';
  autoDismiss?: boolean;
  onDismiss?: () => void;
  durationMs?: number;
  className?: string;
};

const variantClasses: Record<NonNullable<StatusAlertProps['variant']>, string> = {
  success: 'alert alert-success',
  error: 'alert alert-error',
};

function StatusAlert({
  message,
  variant = 'success',
  autoDismiss = variant === 'success',
  onDismiss,
  durationMs = 3000,
  className = '',
}: StatusAlertProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
  }, [message]);

  useEffect(() => {
    if (!message || !visible || !autoDismiss || variant !== 'success') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);

    return () => window.clearTimeout(timeout);
  }, [message, visible, autoDismiss, onDismiss, durationMs, variant]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div className={`${variantClasses[variant]} ${className}`.trim()}>
      <span>{message}</span>
    </div>
  );
}

export default StatusAlert;
