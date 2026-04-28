export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (!error) return next();
  const errors = error.details.map(d => ({
    field:   d.path[0],
    message: d.message,
  }));
  return res.status(422).json({ errors });
};
