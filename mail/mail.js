import nodemailer from "nodemailer";

const email ='thoitienteam@gmail.com'

export default class mailing{


    constructor(){
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 1000,
            secure: false,
            service: 'gmail',
            auth: {
              user: email,
              pass: 'NNT22102001'
            },
            tls: {
                rejectUnauthorized: false
            }
          });
    }

    sendMail(to, subject, text){

        var mailOptions = {
            from: email,
            to: to,
            subject: subject,
            html:text
        }

        this.transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

}