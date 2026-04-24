// validators/message.validator.js
import Joi from "joi";

export const sendMessageSchema = Joi.object({
  receiverId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Receiver is required",
    "any.required": "Receiver is required",
    "string.length": "Invalid receiver ID",
  }),

  content: Joi.when("type", {
    is: "text",
    then: Joi.string().trim().min(1).max(5000).required().messages({
      "string.empty": "Message cannot be empty",
      "string.max": "Message too long — max 5000 characters",
      "any.required": "Content is required for text messages",
    }),
    otherwise: Joi.string().allow("", null).optional(),
  }),

  type: Joi.string()
    .valid("text", "image", "file", "audio", "video", "location", "sticker")
    .default("text"),

  fileUrl: Joi.when("type", {
    is: Joi.valid("image", "file", "audio", "video"),
    then: Joi.string().uri().optional().messages({
      "string.uri": "Invalid file URL",
    }),
    otherwise: Joi.string().allow(null, "").optional(),
  }),

  fileName: Joi.string().max(255).allow(null, "").optional(),
  fileSize: Joi.number().max(100 * 1024 * 1024).allow(null).optional(),
  mimeType: Joi.string().allow(null, "").optional(),
  filePublicId: Joi.string().allow(null, "").optional(),

  replyTo: Joi.string().hex().length(24).allow(null).optional().messages({
    "string.length": "Invalid reply message ID",
  }),
});

export const editMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required().messages({
    "string.empty": "Content cannot be empty",
    "any.required": "Content is required",
  }),
});

export const reactSchema = Joi.object({
  emoji: Joi.string().min(1).max(10).required().messages({
    "any.required": "Emoji is required",
  }),
});

// Validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,     // সব error একসাথে দেখাও
    stripUnknown: true,    // extra field সরিয়ে দাও
    convert: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors });
  }

  req.body = value;
  next();
};