const asyncHandler = (requestHandler) => {
  // next is the middleware
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
