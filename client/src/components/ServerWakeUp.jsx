export default function ServerWakeUp({ status }) {
  if (status === 'awake') return null;

  if (status === 'error') {
    return (
      <div className="banner banner--error" role="alert">
        <span className="banner__icon">⚠️</span>
        <span>Server unavailable. Please refresh the page in a minute.</span>
      </div>
    );
  }

  return (
    <div className="banner banner--info" role="status">
      <span className="banner__spinner" />
      <span>
        {status === 'checking'
          ? 'Connecting to server…'
          : 'Server is waking up — this takes 30–50 seconds on first load. Please wait.'}
      </span>
    </div>
  );
}
