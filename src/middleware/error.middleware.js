
import { errorResponse } from '../utils/response.util.js';

const isProd = process.env.NODE_ENV === 'production';

const formatValidationArray = (arr) =>
	arr.map((e) => ({ message: e.msg || e.message, param: e.param, location: e.location }));

const errorMiddleware = (err, req, res, next) => {
	let statusCode = err && err.statusCode ? err.statusCode : 500;
	let message = err && err.message ? err.message : 'Internal Server Error';
	let errors = [];

	if (Array.isArray(err) && err.length && err[0].msg) {
		statusCode = 422;
		message = 'Validation failed';
		errors = formatValidationArray(err);
		return errorResponse(res, { statusCode, message, errors });
	}

	if (err && err.errors && Array.isArray(err.errors)) {
		errors = formatValidationArray(err.errors);
		statusCode = err.statusCode || 422;
		return errorResponse(res, { statusCode, message, errors });
	}

	if (err && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
		statusCode = 401;
		message = 'Authentication failed';
		errors = [{ message: err.message }];
		return errorResponse(res, { statusCode, message, errors });
	}

	if (err && err.type === 'entity.parse.failed') {
		statusCode = 400;
		message = 'Malformed JSON body';
		errors = [{ message: err.message }];
		return errorResponse(res, { statusCode, message, errors });
	}

	if (!isProd && err && err.stack) {
  console.error(err.stack);
}


	return errorResponse(res, { statusCode, message, errors });
};

export default errorMiddleware;
