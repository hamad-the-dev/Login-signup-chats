import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
export const register = async (req, res) => {
    console.log(req.body,'reqqqqq')
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ 
            success: true,
            message: "Register successfully",
            user: { name: user.name, email: user.email }
         });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Please Signup Your Account" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome to Invextech`,
            text: `Welcome to Invextech website. Your account is created with email ID: ${email}`,
        };

        await transporter.sendMail(mailOptions);        return res.json({
            success: true,
            message: "Logged in successfully",
            user: { 
                name: user.name, 
                email: user.email,
                _id: user._id,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
  
// this is logout the user details
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendVerifyotp = async (req, res) => {
    try {
        console.log('Request body:', req.body); 
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }
        const user = await userModel.findOne({ email });
        console.log('Found user:', user); 
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; 
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your account OTP',
            text: `Your verification OTP is ${otp}.`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Verification OTP sent to your email' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    console.log('Verify Email Request body:', req.body); 
    const { userid, otp } = req.body;

    if (!userid || !otp) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const user = await userModel.findById(userid);
        console.log('Found user for verification:', user);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {

    try {
        return res.json({ success: true, message: 'User is authenticated' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetotp = otp;
        user.resetotpExpireAt = Date.now() + 15 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OTP',
            text: `Your OTP for resetting your password is ${otp}. 
            Use this OTP to reset your password.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'Reset OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newpassword } = req.body;

    if (!email || !otp || !newpassword) {
        return res.json({ success: false, message: 'Email, OTP, and New Password are required' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.resetotp === '' || user.resetotp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetotpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedPassword;
        user.resetotp = '';
        user.resetotpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}