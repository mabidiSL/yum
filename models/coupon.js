const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        allowNull: true
    },
    transName: {
        type: String,
        allowNull: true
    },
    termsAndConditions: {
        type: String,
        allowNull: true
    },
    transTermsAndConditions: {
        type: String,
        allowNull: true
    },
    codeCoupon: {
        type: String,
        allowNull: true,
        unique: true
    },
    qrCode: {
        type: String,
        allowNull: true
    },
    urlStore: {
        type: String,
        allowNull: true
    },
    // countryId: { // Foreign key
    //   type: DataTypes.INTEGER,
    //   allowNull: true
    // },
    // areaId: { // Foreign key
    //   type: DataTypes.INTEGER,
    //   allowNull: true
    // },
    // cityId: { // Foreign key
    //   type: DataTypes.INTEGER,
    //   allowNull: true
    // },
    quantity: {
        type: Number,
        allowNull: true
    },
    merchantId: { // Foreign key
        type: Number,
        allowNull: true
    },
    // storeId: { // Foreign key
    //   type: DataTypes.INTEGER,
    //   allowNull: true
    // },
    managerName: {
        type: String,
        allowNull: true
    },
    managerPhone: {
        type: String,
        allowNull: true
    },
    startDateCoupon: {
        type: Date,
        allowNull: true
    },
    endDateCoupon: {
        type: Date,
        allowNull: true
    },
    contractRepName: {
        type: String,
        allowNull: true
    },
    sectionOrderAppearance: {
        type: String,
        allowNull: true
    },
    categoryOrderAppearance: {
        type: String,
        allowNull: true
    },
    centerLogo: {
        type: String,
        allowNull: true
    },
    couponLogo: {
        type: String,
        allowNull: true
    },
    couponType: {
        type: String,
        enum:['free', 'discountPercent', 'discountAmount', 'servicePrice'],
    },
    couponValueBeforeDiscount: {
        type: Number,
        allowNull: true
    },
    couponValueAfterDiscount: {
        type: Number,
        allowNull: true
    },
    paymentDiscountRate: {
        type: Number,
        allowNull: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'expired', 'closed'],
        default: 'pending'
    }
});


module.exports = mongoose.model('Coupon', CouponSchema);