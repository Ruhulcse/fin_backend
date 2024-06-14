module.exports.createResponse = (
  data = null,
  message = null,
  error = false
) => {
  if (error) {
    return {
      error: true,
      message,
    };
  }
  if (!error) {
    return {
      error: false,
      message,
      data,
    };
  }
};
