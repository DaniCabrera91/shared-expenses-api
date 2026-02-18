const validate = (schema) => (req, res, next) => {
  try {
    req.validatedData = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
