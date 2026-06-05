// Small helper to keep service errors consistent across auth flows.
const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = createHttpError;
