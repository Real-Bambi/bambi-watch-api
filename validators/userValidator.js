import Joi from "joi";

export const updateProfileSchema = Joi.object({
  bio: Joi.string().max(200).allow(""),
  // Avatar handled by Multer, so no Joi field needed for it.
});
