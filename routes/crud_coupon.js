'use strict';
const express = require('express');
const cRoute = express.Router();

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transport = require('../config/nodemailer');
const jwt = require('jsonwebtoken');
const Coupon = require('../models/coupon');
const auth = require('../middleware/auth'); // Import the auth middleware
const { Console } = require('console');

const upload = require('../config/multerConfig');
const b2 = require('../config/b2Config');
const fs = require('fs');
const path = require('path');


const bucketName = 'yummy-user-p';

const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';
const SECRET_KEY = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e0';

// Connect to MongoDB
mongoose.connect(MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

//create coupon
cRoute.post('/coupon', auth, async (req, res) => {

    // console.log('Request Body:', req.body);

    try {
        const code = Math.random().toString(36).substring(2, 8);
        
        let data=req.body;
        data.codeCoupon=code;
        
        const coupon = new Coupon(data);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get all coupons
cRoute.get('/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find();
        console.log(coupons);
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get coupon by id
cRoute.get('/coupon', async (req, res) => {
    try {
        console.log(req.params);
        console.log(req.query.idMeal);
        const coupon = await Coupon.findOne({ idMeal: req.query.idMeal });
        if (!coupon) {
            return res.status(404).json({ message: 'coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update coupon
cRoute.put('/coupon', auth, async (req, res) => {
    try {
        const { _id } = req.body;
        console.log(req.body);
        await Coupon.findByIdAndUpdate(
            _id,
            req.body,
            { new: true });
        res.send('coupon updated');
    } catch (error) {
        res.status(500).send('Error updating coupon ' + error);
    }
});

//delete coupon
cRoute.delete('/coupon', auth, async (req, res) => {
    try {
        const { _id } = req.body;

        await Coupon.findByIdAndDelete(_id);
        res.send('coupon deleted');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});



//testing api
cRoute.use('/coupontest', function (req, res, next) {
    console.log("crud coupon working");
    res.sendStatus(404);
})

module.exports = cRoute;