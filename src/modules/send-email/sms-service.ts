import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly baseUrl = 'https://api-sms.4jawaly.com/api/v1';
  private readonly apiKey = process.env.FOURJAWALY_API_KEY;
  private readonly apiSecret = process.env.FOURJAWALY_API_SECRET;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization:
        'Basic ' +
        Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64'),
    };
  }

  // ✅ Send Single SMS
  async sendSms(phone: string, message: string, sender?: string) {
    try {
      const payload = {
        recipients: phone.replace('+', ''), // الرقم بدون +
        body: message,
        sender: sender|| 'MNTAHSCI',
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/account/area/sms/v2/send`,
          payload,
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `SMS sent to ${phone}: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }

  // ✅ Get Available Senders
  async getSenders(options: any = {}) {
    try {
      const params = {
        page_size: options.page_size ?? 10,
        page: options.page ?? 1,
        status: options.status ?? 1,
        return_collection: options.return_collection ?? 1,
      };

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/account/area/senders`, {
          headers: this.getHeaders(),
          params,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error getting senders: ${error.response?.data || error.message}`,
      );
      return null;
    }
  }

  // ✅ Check Balance
  async checkBalance(options: any = {}) {
    try {
      const params = {
        is_active: options.is_active ?? 1,
        order_by: options.order_by ?? 'id',
        order_by_type: options.order_by_type ?? 'desc',
        page: options.page ?? 1,
        page_size: options.page_size ?? 10,
        return_collection: options.return_collection ?? 1,
      };

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/account/area/me/packages`, {
          headers: this.getHeaders(),
          params,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error checking balance: ${error.response?.data || error.message}`,
      );
      return null;
    }
  }
}
