const Joi = require('joi');
module.exports.joiSchema = Joi.object(
   {
      name: Joi.string().required(),
      image: Joi.string().required().min(0),
      location: Joi.string().required(),
      consultationPrice: Joi.number().required(),
      description: Joi.string().required(),
      specialization: Joi.string().required(),
   }
);

module.exports.reviewSchema = Joi.object({
   reviews: Joi.object({
      body: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required()
   }).required()
})