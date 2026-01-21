import { findContactById } from '../models/contact.model.js';
import { updateContactStatusById } from '../models/status.model.js';
import { successResponse } from '../utils/response.util.js';
import {
 assertValidStatus,
  assertTransitionAllowed,
} from '../utils/contactStatus.util.js';

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: nextStatus } = req.body;

    // 1️⃣ Basic input validation
    if (!nextStatus) {
      const err = new Error('Next status is required');
      err.statusCode = 422;
      throw err;
    }

    assertValidStatus(nextStatus);

    // 2️⃣ Fetch existing contact
    const contact = await findContactById(id);
    if (!contact) {
      const err = new Error('Contact not found');
      err.statusCode = 404;
      throw err;
    }

    // 3️⃣ Domain rule validation
    assertTransitionAllowed(contact.status, nextStatus);

    // 4️⃣ DB update via status model
    const updated = await updateContactStatusById(id, nextStatus);
    if (!updated) {
      const err = new Error('Failed to update contact status');
      err.statusCode = 500;
      throw err;
    }

    // 5️⃣ Success response
    return successResponse(res, {
      message: 'Contact status updated successfully',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
};

export { updateStatus };
