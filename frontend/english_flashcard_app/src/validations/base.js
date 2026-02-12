export const yupToFieldErrors = (err) => {
  const errors = {};

  if (!err) return errors;

  if (Array.isArray(err.inner) && err.inner.length > 0) {
    for (const item of err.inner) {
      const path = item?.path;
      const message = item?.message;
      if (!path || !message) continue;
      if (!errors[path]) errors[path] = [];
      errors[path].push(message);
    }
    return errors;
  }

  if (err.path && err.message) {
    errors[err.path] = [err.message];
  }

  return errors;
};

export const validateWithSchema = async (schema, data, options = {}) => {
  try {
    const validatedData = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      ...options,
    });

    return { validatedData, errors: null };
  } catch (err) {
    if (err?.name !== "ValidationError") throw err;
    return { validatedData: null, errors: yupToFieldErrors(err) };
  }
};
