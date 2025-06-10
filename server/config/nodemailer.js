import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({

    // host: 'smtp.ethereal.email',
    service: 'gmail',
    // port: 587,
    secure: false,
    auth :{
        user: 'hamadahamd51@gmail.com',
        pass: 'npjfypklcsxzuyph'
    }
});

export default transporter;