const errorMiddleware = (err, req, res, next) => {
  let error = {...err}
  error.message = err.message
  console.log(err.stack)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorMiddleware