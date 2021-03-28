const getErrorResponse = (message) => ({
    status: "error",
    message: message
});

module.exports = getErrorResponse;