class HttpError extends Error {
  //* Adding custom message property and error code (add 404, 500, etc dynamically)
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
  }
}

module.exports = HttpError;
