import * as nodemailer from 'nodemailer';
import { SENDER_EMAIL_PASSWORD, EMAIL_SERVICE, SENDER_EMAIL } from '.';

export const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: { user: SENDER_EMAIL, pass: SENDER_EMAIL_PASSWORD },
});
