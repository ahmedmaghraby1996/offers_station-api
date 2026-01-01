import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { encrypt } from './crypto.util';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Credentials from environment or defaults (as provided in the request)
  private readonly terminalId = process.env.NEOLEAP_TERMINAL_ID || 'PG426500';
  private readonly tranportalId =
    process.env.NEOLEAP_TRANPORTAL_ID || 'bR5T3Pni7UeVp08';
  private readonly password = process.env.NEOLEAP_PASSWORD || 'Q6#S#j31i#4JqnO';
  private readonly resourceKey =
    process.env.NEOLEAP_RESOURCE_KEY || '53656308399353656308399353656308';
  private readonly paymentUrl =
    process.env.NEOLEAP_PAYMENT_URL ||
    'https://securepayments.neoleap.com.sa/pg/payment/tranportal.htm';
  private readonly responseUrl =
    process.env.NEOLEAP_RESPONSE_URL ||
    'https://your-domain.com/payment/response'; // Needs update
  private readonly errorUrl =
    process.env.NEOLEAP_ERROR_URL || 'https://your-domain.com/payment/error'; // Needs update

  async createPayment(
    amount: number,
    trackId: string,
    customerIp: string = '127.0.0.1',
    udf1: string = '',
    udf2: string = '',
    udf3: string = '',
    udf4: string = '',
    udf5: string = '',
  ) {
    const trandata = {
      amt: amount.toFixed(2),
      action: '1', // Purchase
      password: this.password,
      id: this.tranportalId,
      currencyCode: '682', // SAR
      trackId,
      responseURL: this.responseUrl,
      errorURL: this.errorUrl,
      langid: 'ar',
      terminalId: this.terminalId, // Added terminalId
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    };

    this.logger.log(
      `Creating payment with TrackID: ${trackId}, Amount: ${amount}, TerminalID: ${this.terminalId}`,
    );

    // Log the trandata (excluding password for security)
    const { password, ...logData } = trandata;
    this.logger.debug(`Trandata payload: ${JSON.stringify(logData)}`);

    const encryptedTrandata = encrypt(
      JSON.stringify(trandata),
      this.resourceKey,
    );

    const payload = {
      id: this.tranportalId,
      trandata: encryptedTrandata,
      responseURL: this.responseUrl,
      errorURL: this.errorUrl,
    };

    try {
      const response = await axios.post(this.paymentUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-FORWARDED-FOR': customerIp,
        },
      });

      this.logger.debug('Payment response received', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Payment request failed', error.message);
      if (error.response) {
        this.logger.error('Error details:', error.response.data);
      }
      throw error;
    }
  }
}
