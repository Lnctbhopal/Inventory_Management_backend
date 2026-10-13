export const errorHandler = (err, req, res, next) => {
     console.error(err);

  const statusCode =
    err.statusCode ||
    err.status ||
    (err.name === "MulterError" ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};