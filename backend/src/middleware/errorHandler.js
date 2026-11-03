const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : error.message,
  });
};

export default errorHandler;