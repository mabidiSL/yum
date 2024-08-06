'use strict';
const express = require('express');
const exRoute = express.Router();

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transport = require('../config/nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Recipe = require('../models/recipesLikes');
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

exRoute.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Log the received body
        console.log('Request Body:', req.body);

        // Check if any of the required fields are missing
        if (!username || !email || !password) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        // Generate reset token and expiry
        newUser.generatePin();

        const mailOptions = {
            to: newUser.email,
            from: "bouda996@gmail.com",
            subject: 'Email Verification',
            html: `<!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#9095a2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (min-width: 481px) {
h2,h3{color:#333;mso-text-raise:2px}img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#9095a2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1,h2,h3{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;text-align:left;mso-line-height-rule:exactly}h1{line-height:52px;font-size:48px;color:#000;mso-text-raise:1px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t18{padding-bottom:100px!important;width:620px!important}.t13,.t16,.t25,.t29,.t31,.t5,.t9{width:475px!important}.t3{mso-line-height-alt:90px!important;line-height:90px!important}.t23,.t7{mso-line-height-alt:40px!important;line-height:40px!important}.t5{padding-bottom:40px!important}.t4{line-height:52px!important;font-size:48px!important;mso-text-raise:1px!important}.t11,.t12,.t8{line-height:28px!important}.t11{mso-line-height-alt:28px!important}.t12,.t8{font-size:18px!important}.t15{mso-line-height-alt:50px!important;line-height:50px!important}.t33{padding-top:80px!important;padding-bottom:80px!important;width:620px!important}.t21{padding-bottom:60px!important;width:475px!important}
}
</style>
<style type="text/css">@media (min-width: 481px) {[class~="x_t18"]{padding-bottom:100px!important;width:620px!important;} [class~="x_t16"]{width:475px!important;} [class~="x_t3"]{mso-line-height-alt:90px!important;line-height:90px!important;} [class~="x_t7"]{mso-line-height-alt:40px!important;line-height:40px!important;} [class~="x_t5"]{padding-bottom:40px!important;width:475px!important;} [class~="x_t4"]{line-height:52px!important;font-size:48px!important;mso-text-raise:1px!important;} [class~="x_t11"]{mso-line-height-alt:28px!important;line-height:28px!important;} [class~="x_t9"]{width:475px!important;} [class~="x_t8"]{line-height:28px!important;font-size:18px!important;} [class~="x_t15"]{mso-line-height-alt:50px!important;line-height:50px!important;} [class~="x_t13"]{width:475px!important;} [class~="x_t12"]{line-height:28px!important;font-size:18px!important;} [class~="x_t33"]{padding-top:80px!important;padding-bottom:80px!important;width:620px!important;} [class~="x_t31"]{width:475px!important;} [class~="x_t23"]{mso-line-height-alt:40px!important;line-height:40px!important;} [class~="x_t21"]{padding-bottom:60px!important;width:475px!important;} [class~="x_t25"]{width:475px!important;} [class~="x_t29"]{width:475px!important;}}</style>
<style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#9095a2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}.moz-text-html h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t18{padding-bottom:100px!important;width:620px!important}.moz-text-html .t16{width:475px!important}.moz-text-html .t3{mso-line-height-alt:90px!important;line-height:90px!important}.moz-text-html .t7{mso-line-height-alt:40px!important;line-height:40px!important}.moz-text-html .t5{padding-bottom:40px!important;width:475px!important}.moz-text-html .t4{line-height:52px!important;font-size:48px!important;mso-text-raise:1px!important}.moz-text-html .t11{mso-line-height-alt:28px!important;line-height:28px!important}.moz-text-html .t9{width:475px!important}.moz-text-html .t8{line-height:28px!important;font-size:18px!important}.moz-text-html .t15{mso-line-height-alt:50px!important;line-height:50px!important}.moz-text-html .t13{width:475px!important}.moz-text-html .t12{line-height:28px!important;font-size:18px!important}.moz-text-html .t33{padding-top:80px!important;padding-bottom:80px!important;width:620px!important}.moz-text-html .t31{width:475px!important}.moz-text-html .t23{mso-line-height-alt:40px!important;line-height:40px!important}.moz-text-html .t21{padding-bottom:60px!important;width:475px!important}.moz-text-html .t25,.moz-text-html .t29{width:475px!important}</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<style type="text/css">
img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#9095a2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}td.t18{padding-bottom:100px !important}div.t3{mso-line-height-alt:90px !important;line-height:90px !important}div.t7{mso-line-height-alt:40px !important;line-height:40px !important}td.t5{padding-bottom:40px !important}h1.t4{line-height:52px !important;font-size:48px !important;mso-text-raise:1px !important}div.t11{mso-line-height-alt:28px !important;line-height:28px !important}p.t8{line-height:28px !important;font-size:18px !important}div.t15{mso-line-height-alt:50px !important;line-height:50px !important}p.t12{line-height:28px !important;font-size:18px !important}td.t33{padding-top:80px !important;padding-bottom:80px !important}div.t23{mso-line-height-alt:40px !important;line-height:40px !important}td.t21{padding-bottom:60px !important}
</style>
<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t37" style="min-width:100%;Margin:0px;padding:0px;background-color:#EDEDED;"><div class="t36" style="background-color:#EDEDED;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t35" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#EDEDED;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#EDEDED"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t19" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="680" class="t18" style="background-color:#FFFFFF;padding:60px 30px 70px 30px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t18" style="background-color:#FFFFFF;width:420px;padding:60px 30px 70px 30px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%!important;"><tr><td align="center">
<table class="t17" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t16">
<![endif]-->
<!--[if !mso]>-->
<td class="t16" style="width:420px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%!important;"><tr><td align="left">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="40" class="t1">
<![endif]-->
<!--[if !mso]>-->
<td class="t1" style="width:40px;">
<!--<![endif]-->
<div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="40" height="40" alt="" src="https://ec7f5073-c64f-4bb2-a933-4b9a473873ff.b-cdn.net/e/32787747-7912-4748-a89f-7c0d5e6354b7/40f24053-9767-4737-b971-7b4ce27f205a.jpeg"/></div></td>
</tr></table>
</td></tr><tr><td><div class="t3" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t5" style="border-bottom:1px solid #E1E2E6;padding:0 0 30px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t5" style="border-bottom:1px solid #E1E2E6;width:420px;padding:0 0 30px 0;">
<!--<![endif]-->
<h1 class="t4" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:38px;font-weight:700;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Verify your Email</h1></td>
</tr></table>
</td></tr><tr><td><div class="t7" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t9">
<![endif]-->
<!--[if !mso]>-->
<td class="t9" style="width:420px;">
<!--<![endif]-->
<p class="t8" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">You&#39;re receiving this e-mail because you Registered to our App.</p></td>
</tr></table>
</td></tr><tr><td><div class="t11" style="mso-line-height-rule:exactly;mso-line-height-alt:18px;line-height:18px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t13">
<![endif]-->
<!--[if !mso]>-->
<td class="t13" style="width:420px;">
<!--<![endif]-->
<p class="t12" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Your Verification PIN is: ${newUser.pin}\n\n</p></td>
</tr></table>
</td></tr><tr><td><div class="t15" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="680" class="t33" style="background-color:#000000;padding:60px 30px 60px 30px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t33" style="background-color:#000000;width:420px;padding:60px 30px 60px 30px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%!important;"><tr><td align="center">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t31">
<![endif]-->
<!--[if !mso]>-->
<td class="t31" style="width:420px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%!important;"><tr><td align="center">
<table class="t22" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t21" style="border-bottom:1px solid #262626;padding:0 0 40px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t21" style="border-bottom:1px solid #262626;width:420px;padding:0 0 40px 0;">
<!--<![endif]-->
<h1 class="t20" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:32px;font-weight:600;font-style:normal;font-size:32px;text-decoration:none;text-transform:none;direction:ltr;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;">Yummy</h1></td>
</tr></table>
</td></tr><tr><td><div class="t23" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t25">
<![endif]-->
<!--[if !mso]>-->
<td class="t25" style="width:420px;">
<!--<![endif]-->
<p class="t24" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">If you do not want to register, you can ignore and delete this email.</p></td>
</tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t30" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<tr>
<!--[if mso]>
<td width="475" class="t29">
<![endif]-->
<!--[if !mso]>-->
<td class="t29" style="width:420px;">
<!--<![endif]-->
<p class="t28" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Yummy. All rights reserved</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`,

        };
        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: 'Error sending verification email', error: err.message });
            }
            res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
        });


        await newUser.save();

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

exRoute.post('/verify-email', async (req, res) => {
    const { pin } = req.body;

    try {
        const user = await User.findOne({
            pin: pin,
            pinExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid pin' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        user.emailVerifiedAt = true;

        user.pin = undefined;
        user.pinExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired pin' });
    }
});


exRoute.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(email);
        console.log(password);
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).send('Error logging in user');
    }
});

exRoute.put('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        console.log(req.body);
        await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true });

        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (error) {
        res.status(500).send('Error updating user ' + error);
    }
});

// Update user password
exRoute.put('/:id/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;



    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the current password is correct
        //   const isMatch = await user.compare(currentPassword);
        const isMatch = bcrypt.compare(currentPassword, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//upload user profile image
exRoute.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileContent = fs.readFileSync(req.file.path);
        const params = {
            Bucket: bucketName,
            Key: req.file.filename,
            Body: fileContent,
            ContentType: req.file.mimetype,
        };

        const data = await b2.upload(params).promise();

        fs.unlinkSync(req.file.path); // Remove file from server after upload

        res.status(200).json({ fileUrl: data.Location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//delete user profile image

exRoute.delete('/delete/:filename', async (req, res) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: req.params.filename,
        };

        await b2.deleteObject(params).promise();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

exRoute.delete('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;

        await User.findByIdAndDelete(userId);
        res.send('User deleted');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});


exRoute.get('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
});

exRoute.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

// Route to request password reset
exRoute.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        // const user = await User.findOne({ email: req.body.email });
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('No user with that email');
        }

        // Generate reset token and expiry
        user.generatePin();
        await user.save();
        // Send the email
        const mailOptions = {
            to: user.email,
            from: "bouda996@gmail.com",
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
      Your password reset PIN is: ${user.Pin}\n\n
      This PIN is valid for one hour.\n`,
        };
        transport.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send('Error sending email   ' + err);
            }
            res.status(200).send('Password reset email sent');
        });
    } catch (error) {
        res.status(500).send('Error on the server   ' + error);
    }
});

// Route to reset password
exRoute.post('/reset-password', async (req, res) => {

    try {
        const { pin, newPassword } = req.body;

        const user = await User.findOne({
            pin: pin,
            pinExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired');
        }

        // Update the user's password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.pin = undefined;
        user.pinExpires = undefined;

        await user.save();

        res.status(200).send('Password has been reset');
    } catch (error) {
        res.status(500).send('Error on the server  ' + error);
    }
});

exRoute.post('/recepies-likes', async (req, res) => {

    console.log('Request Body:', req.body);

    try {

        const { recipeId, operation } = req.body;

        if (!recipeId) {
            return res.status(400).send({ error: 'Recipe ID is required' });
        }

        const recipe = await Recipe.findOne({ recipeId });

        if (recipe) {
            operation == "add" ? recipe.likesNumber = Number(recipe.likesNumber) + 1 : recipe.likesNumber = Number(recipe.likesNumber) - 1;
            await recipe.save();
        } else {
            const newRecipe = new Recipe({ recipeId: recipeId, likesNumber: 1 });
            await newRecipe.save();
        }

        res.status(200).send('recipe liked');
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).send('Error recipe');
    }
});

exRoute.get('/recepies-likes', async (req, res) => {

    console.log('Request Body:', req.body);
    console.log('Request param:', req.params);
    console.log('Request query:', req.query);

    try {
        const { recipeId } = req.query;

        // Check if any of the required fields are missing
        if (!recipeId) {
            return res.status(400).json({ error: 'Recipe ID is required' });
        }

        const recipe = await Recipe.findOne({ recipeId });
        if (!recipe) return res.status(404).send('Recipe not found');
        res.json(recipe);
    } catch (error) {
        console.error('Error finding recipe:', error);
        res.status(500).send('Error finding recipe');
    }
});

exRoute.use('/test', function (req, res, next) {
    console.log("crud working");
    res.sendStatus(404);
})

module.exports = exRoute;