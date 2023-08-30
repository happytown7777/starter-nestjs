import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export default class EmailService {
    private nodemailerTransport: Mail;

    constructor() {
        this.nodemailerTransport = createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: true,            
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });
    }

    async sendMail(options: Mail.Options) {
        return this.nodemailerTransport.sendMail(options);
    }
}