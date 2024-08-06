import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { NODE_ENV, SENDER_EMAIL } from '@/config';
import { transporter } from '@/config/nodemailer';
import { generateEmailContent, getSendEmailPayload } from '@/utils';

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

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

    if (NODE_ENV === 'production' && status === 500) {
      const html = generateEmailContent({
        path: req.path,
        method: req.method,
        status: status,
        message: message,
      });
      transporter.sendMail(
        getSendEmailPayload({
          to: SENDER_EMAIL,
          subject: 'Internal Server Error',
          html,
        }),
      );
    }
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
