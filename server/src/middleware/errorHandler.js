export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.code ?? '', err.message);
  // Never send raw SQLite errors or stack traces to the client
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ error: err.message });
  }
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Duplicate request' });
  }
  return res.status(500).json({ error: 'Internal server error' });
};

