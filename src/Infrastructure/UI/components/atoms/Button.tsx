import styles from './Button.module.css';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'ghost';
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

// Átomo: botón puro. Cero PLOCs, todo por props.
export function Button({
  label,
  variant = 'primary',
  block = false,
  disabled = false,
  type = 'button',
  onClick,
}: ButtonProps): React.JSX.Element {
  const cls = [styles.btn, variant === 'primary' ? styles.btnPrimary : styles.btnGhost, block ? styles.btnBlock : '']
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {label}
    </button>
  );
}
