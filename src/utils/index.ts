import Mail from 'nodemailer/lib/mailer';
import { SENDER_EMAIL } from '@/config';

export const splitAndTrimString = (str: string = '', sep: string = ',') => {
  return str.split(sep).map(s => s.trim());
};

export const getSendEmailPayload = ({ to, subject, html }: Mail.Options): Mail.Options => {
  return {
    from: SENDER_EMAIL,
    to,
    subject,
    html,
  };
};

export const generateEmailContent = ({ path, method, status, message }) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #d9534f;">Internal Server Error</h2>
      <p>The <strong>'scrapper_zameen_backend'</strong> project encountered an internal server error. Details are below:</p>
      <ul style="list-style-type: none; padding: 0;">
        <li><strong>Request Path:</strong> ${path}</li>
        <li><strong>Request Method:</strong> ${method}</li>
        <li><strong>Response Status:</strong> ${status}</li>
        <li><strong>Error Message:</strong> ${message}</li>
      </ul>
    </div>
  `;
};
