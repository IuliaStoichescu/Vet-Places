const { Timestamp } = require('bson');
const mongoose = require('mongoose');
const { type } = require('node:os');
const Schema = mongoose.Schema;

const VetPlacesSchema = new Schema(
   {
      name: String,
      image: String,
      location: String,
      consultationPrice: Number,
      description: String,
      specialization: {
         type: String,
         enum: ['general', 'surgery', 'dentistry', 'exoticAnimals', 'emergency', 'dermatology']
      }
   }
)

module.exports = mongoose.model("Vetplace", VetPlacesSchema);