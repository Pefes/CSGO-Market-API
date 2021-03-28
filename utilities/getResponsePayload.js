const getResponsePayload = (status, message, data) => ({
    status: status,
    message: message,
    data: data
});

module.exports = getResponsePayload;