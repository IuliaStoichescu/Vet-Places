const { Timestamp } = require('bson');
const mongoose = require('mongoose');
const { type } = require('node:os');
const Review = require('./review');
const Schema = mongoose.Schema;

const VetPlacesSchema = new Schema(
   {
      name: String,
      image: String,
      location: String,
      consultationPrice: Number,
      description: String,
      author: {
         tyle: Schema.Types.ObjectId,
         ref: 'User'
      },
      specialization: {
         type: String,
         enum: ['general', 'surgery', 'dentistry', 'exoticAnimals', 'emergency', 'dermatology']
      },
      reviews: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Review'
         }
      ]
   }
)

VetPlacesSchema.post('findOneAndDelete', async function (doc) {//will have access to the doc that was deleted
   if (doc) {
      await Review.deleteMany({ //tthis is for deleting reviews when deleting a vet place
         _id: {
            $in: doc.reviews //the id is somewhere in the reviews
         }
      })
   }
})

module.exports = mongoose.model("Vetplace", VetPlacesSchema);