const asyncHandler = (requestHandler) => {
  // next is the middleware
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// The Promise.resolve() is used as a safety mechanism to ensure that both sync and async functions are handled consistently.

// What it does:
// Converts any value to a Promise:

// If requestHandler returns a Promise (async function) → Promise.resolve() passes it through unchanged
// If requestHandler returns a regular value (sync function) → Promise.resolve() wraps it in a resolved Promise
// Enables uniform error handling: By ensuring everything is a Promise, you can always use .catch() to handle errors

// Without Promise.resolve():
// If you just did requestHandler(req, res, next).catch(), it would crash if someone passed a sync function because sync functions don't return Promises and don't have a .catch() method.

// The key benefit:
// This makes the asyncHandler robust - it can wrap any function (sync or async) and guarantee that errors are caught and passed to Express error middleware via next(err).
