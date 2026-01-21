
import { createContact, countContacts, findContacts, findContactById, findLatest } from '../models/contact.model.js';
import { successResponse } from '../utils/response.util.js';
import { sendNewContactWebhook } from '../services/webhook.service.js';

const create = async (req, res, next) => {
	try {
		const { name, email, phone, message } = req.body;
		const contact = await createContact({ name, email, phone, message });
        sendNewContactWebhook(contact);
		return successResponse(res, { statusCode: 201, message: 'Contact submitted', data: contact });
	} catch (err) {
		return next(err);
	}
};

const list = async (req, res, next) => {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
		const offset = (page - 1) * limit;

		const [totalRecords, rows] = await Promise.all([countContacts(), findContacts({ offset, limit })]);

		const totalPages = Math.ceil(totalRecords / limit) || 1;

		const data = {
			contacts: rows,
			meta: { page, limit, totalRecords, totalPages },
		};

		return successResponse(res, { statusCode: 200, data });
	} catch (err) {
		return next(err);
	}
};

const getById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const contact = await findContactById(id);
		if (!contact) {
			const e = new Error('Contact not found');
			e.statusCode = 404;
			return next(e);
		}
		return successResponse(res, { statusCode: 200, data: contact });
	} catch (err) {
		return next(err);
	}
};

const latest = async (req, res, next) => {
	try {
		const rows = await findLatest(5);
		return successResponse(res, { statusCode: 200, data: { contacts: rows } });
	} catch (err) {
		return next(err);
	}
};

export { create, list, getById, latest };
