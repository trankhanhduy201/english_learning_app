export const yupToFieldErrors = (err) => {
  const errors = {};

  const parsePathTokens = (path) => {
    const tokens = [];
    const matcher = /[^.[\]]+|\[(\d+)\]/g;
    let match;

    while ((match = matcher.exec(path)) !== null) {
      if (match[1] !== undefined) {
        tokens.push(Number(match[1]));
      } else {
        tokens.push(match[0]);
      }
    }

    return tokens;
  };

  const pushNestedError = (target, path, message) => {
    const tokens = parsePathTokens(path);
    if (tokens.length === 0) return;

    let cursor = target;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const isLast = i === tokens.length - 1;
      const nextToken = tokens[i + 1];

      if (isLast) {
        if (typeof token === "number") {
          if (!Array.isArray(cursor)) return;
          if (!Array.isArray(cursor[token])) cursor[token] = [];
          cursor[token].push(message);
          return;
        }

        if (!Array.isArray(cursor[token])) cursor[token] = [];
        cursor[token].push(message);
        return;
      }

      if (typeof token === "number") {
        if (!Array.isArray(cursor)) return;
        if (cursor[token] == null) {
          cursor[token] = typeof nextToken === "number" ? [] : {};
        }
        cursor = cursor[token];
        continue;
      }

      if (cursor[token] == null) {
        cursor[token] = typeof nextToken === "number" ? [] : {};
      }
      cursor = cursor[token];
    }
  };

  if (!err) return errors;

  if (Array.isArray(err.inner) && err.inner.length > 0) {
    for (const item of err.inner) {
      const path = item?.path;
      const message = item?.message;
      if (!path || !message) continue;
      pushNestedError(errors, path, message);
    }
    return errors;
  }

  if (err.path && err.message) {
    pushNestedError(errors, err.path, err.message);
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

export const isImageFile = (file) => {
  if (!(file instanceof File)) return false;

  const mimeType = (file.type ?? "").toLowerCase();
  if (mimeType) return mimeType.startsWith("image/");

  const name = (file.name ?? "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);
};
