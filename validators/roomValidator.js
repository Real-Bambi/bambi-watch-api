import Joi from "joi";

export const createRoomSchema = Joi.object({
  videoUrl: Joi.string().uri().required(),
  name: Joi.string().min(3).max(50).optional(),
});
