import styles from './CredentialsList.module.css';

export interface CredentialEntryType {
  label: string;
  value: string;
  /** Los secretos se renderizan en <code> para distinguirlos. */
  secret?: boolean;
}

// Molécula: compone elementos sobre átomos de texto. Solo props, cero PLOCs.
export function CredentialsList({ entries }: { entries: CredentialEntryType[] }): React.JSX.Element {
  return (
    <dl className={styles.creds}>
      {entries.map((e) => (
        <div key={e.label}>
          <dt className={styles.credsTerm}>{e.label}</dt>
          <dd className={styles.credsValue}>{e.secret ? <code className={styles.credsCode}>{e.value}</code> : e.value}</dd>
        </div>
      ))}
    </dl>
  );
}
