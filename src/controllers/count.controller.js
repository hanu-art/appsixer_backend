import { getContactStatsFromDB } from "../models/count.model.js";
import { successResponse } from "../utils/response.util.js";

const getContactStats = async (req, res, next) => {
  try {
    const stats = await getContactStatsFromDB();

    return successResponse(res, {
      message: "Contact statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export { getContactStats };
