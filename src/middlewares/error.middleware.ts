import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { NODE_ENV, EMAIL_RECIPIENTS_LIST } from '@/config';
import { transporter } from '@/config/nodemailer';
import { generateEmailContent, getSendEmailPayload, sendMessageToSlack, splitAndTrimString } from '@/utils';

export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    let message: string = '';
    if (error instanceof Error) {
      logger.error(error.stack);
      message = error.message;
    } else {
      message = JSON.stringify(error);
    }
    const status: number = error.status || 500;

    const { path, method } = req;
    logger.error(`[${method}] ${path} >> StatusCode:: ${status}, Message:: ${message}`);

    if (NODE_ENV === 'production' && status === 500) {
      const html = generateEmailContent({
        path: path,
        method: method,
        status: status,
        message: message,
      });
      const emailReceipients = splitAndTrimString(EMAIL_RECIPIENTS_LIST);
      emailReceipients.forEach(email => {
        transporter.sendMail(
          getSendEmailPayload({
            to: email,
            html,
          }),
        );
      });
      sendMessageToSlack({ path, method, status, message });
    }
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
