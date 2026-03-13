const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
module.exports.joiSchema = Joi.object(
   {
      name: Joi.string().required().escapeHTML(),
      street: Joi.string().required().escapeHTML(),
      // images: Joi.string().required().min(0),
      location: Joi.string().required().escapeHTML(),
      consultationPrice: Joi.number().required(),
      description: Joi.string().required().escapeHTML(),
      specialization: Joi.string().required().escapeHTML(),
      deleteImages: Joi.array()
   },

);

module.exports.reviewSchema = Joi.object({
   reviews: Joi.object({
      body: Joi.string().required().escapeHTML(),
      rating: Joi.number().min(1).max(5).required()
   }).required()
})