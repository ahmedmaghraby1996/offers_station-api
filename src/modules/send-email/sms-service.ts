// src/sms/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiToken = process.env.FOURJAWALY_API_TOKEN;
  private readonly baseUrl = 'https://api.4jawaly.com/sms-api.php';

  constructor(private readonly httpService: HttpService) {}

  async sendSms(phone: string, message: string, sender?: string) {
    try {
      const payload = {
        token: this.apiToken,
        recipients: phone,
        msg: message,
        sender: sender || 'MNTAHSCI'
      };

      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload)
      );

      this.logger.log(`SMS sent to ${phone}: ${response.data.message}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }

  async sendBulkSms(phones: string[], message: string, sender?: string) {
    try {
      const payload = {
        token: this.apiToken,
        recipients: phones.join(','),
        msg: message,
        sender: sender || 'SMS'
      };

      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload)
      );

      this.logger.log(`Bulk SMS sent to ${phones.length} recipients`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send bulk SMS: ${error.message}`);
      throw error;
    }
  }
}