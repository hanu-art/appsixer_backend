
const buildSuccessPayload = (message, data) => {
	const payload = { success: true, message: message || 'Success' };
	if (data !== undefined && data !== null) payload.data = data;
	return payload;
};

const buildErrorPayload = (message, errors) => {
	const payload = { success: false, message: message || 'Error' };
	if (errors !== undefined && errors !== null) {
		payload.errors = Array.isArray(errors) ? errors : [errors];
	} else {
		payload.errors = [];
	}
	return payload;
};

const successResponse = (res, options = {}) => {
	const { statusCode = 200, message, data } = options;
	const payload = buildSuccessPayload(message, data);
	return res.status(statusCode).json(payload);
};

const errorResponse = (res, options = {}) => {
	const { statusCode = 500, message, errors } = options;
	const payload = buildErrorPayload(message, errors);
	return res.status(statusCode).json(payload);
};

export { successResponse, errorResponse };
