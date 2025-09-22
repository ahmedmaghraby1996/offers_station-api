// src/sms/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiToken = "TSG9lU0uJ2SqmmFG7JRalBITXOrDBF4sLervDSZ9";
  private readonly baseUrl = 'https://api-sms.4jawaly.com/api/v1/';

  constructor(private readonly httpService: HttpService) {}

  async sendSms(phone: string, message: string, sender?: string) {
    try {
      const payload = {
        recipients: phone,
        body: message,
        sender: sender || 'MNTAHSCI',
      };

      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`SMS sent to ${phone}: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }

  async sendBulkSms(phones: string[], message: string, sender?: string) {
    try {
      const payload = {
        recipients: phones,
        body: message,
        sender: sender || 'MNTAHSCI',
      };

      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Bulk SMS sent to ${phones.length} recipients`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send bulk SMS: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }
}
