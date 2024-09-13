const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const BMISchema = require('./bmi').schema;
const RecipeSchema = require('./recipe').schema;
const PhoneSchema = require('./phone').schema;
const RoleSchema = require('./role').schema;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, },
  email: { type: String, required: true, unique: true, },
  cin: { type: String, required: true, unique: true, },
  f_name: { type: String, },
  l_name: { type: String, },
  city: { type: String, },
  gender: { type: String, },
  password: { type: String, required: true, },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  emailVerifiedAt: {
    type: String,
    required: false,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  wallet: {
    type: Number,
  },
  loyaltyPoint: {
    type: Number,
  },
  bankName: {
    type: String,
    default: ""
  },
  referCode: {
    type: String,
  },
  referCount: {
    type: String,
    default: ""
  },
  totalOrder: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  image_full_url: {
    type: String,
  },
  phone: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  //modification for infinity
  user_type: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "notApproved"
  },
  city: {
    type: String,
    default: ""
  },
  street: {
    type: String,
    default: ""
  },
  building: {
    type: String,
    default: ""
  },
  company_registration: {
    type: String,
    default: ""
  },
  role: RoleSchema,
  //commented to adapt to infinity
  // emailVerifiedAt: {
  //   type: Boolean,
  //   required: false,
  //   default: false
  // },
  // image: {
  //   type: String,
  //   default: ""
  // },
  // instragramUrl: {
  //   type: String,
  //   default: ""
  // },
  // facebookUrl: {
  //   type: String,
  //   default: ""
  // },
  // pinterestUrl: {
  //   type: String,
  //   default: ""
  // },
  // youtubeUrl: {
  //   type: String,
  //   default: ""
  // },
  // unitOfMeasurement: {
  //   type: String,
  //   default: "Metric"
  // },
  // height: {
  //   type: String,
  //   default: ""
  // },
  // weight: {
  //   type: String,
  //   default: ""
  // },
  // birthdate: {
  //   type: String,
  //   default: ""
  // },
  // gender: {
  //   type: String,
  //   default: ""
  // },
  // phone: PhoneSchema,

  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // bmiHistory: [BMISchema],
  // favoriteRecipies: [RecipeSchema],
  verificationToken: {
    type: String,
  },
  pin: {
    type: String,
  },
  pinExpires: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
});

UserSchema.methods.generatePin = function () {
  this.pin = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit PIN
  this.pinExpires = Date.now() + 3600000; // Expires in 1 hour
};

module.exports = mongoose.model('User', UserSchema);








// const mongoose = require('mongoose')
// const Joi = require('joi')

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         min: 3,
//         max: 100
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         min: 5,
//         max: 255
//     },
//     password: {
//         type: String,
//         required: true,
//         min: 8,
//         max: 100

//     }
// })

// function validateUser(user) {
//     const schema = Joi.object({
//         name: Joi.string().min(3).max(100).required(),
//         email: Joi.string().min(5).max(255).required().email(),
//         password: Joi.string().min(8).max(100).required()
//     })
//     return schema.validate(user)
// }
// const User = mongoose.model('User', userSchema)
// module.exports.validate = validateUser
// module.exports.User = User