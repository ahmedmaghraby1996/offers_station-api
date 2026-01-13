import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { encrypt } from './crypto.util';

export interface CreatePaymentParams {
  amount: number;
  trackId: string;
  customerIp: string; // Now required
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PaymentResponse {
  status: string; // '1' for success, '2' for failure
  result?: string; // paymentId:paymentURL
  error?: string;
  errorText?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Credentials from environment or defaults (as provided in the request)
  private readonly terminalId = process.env.NEOLEAP_TERMINAL_ID; // No default, must be provided if required
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
    'http://127.0.0.1:3000/user/confirm/payment'; // Updated for local testing
  private readonly errorUrl =
    process.env.NEOLEAP_ERROR_URL || 'http://127.0.0.1:3000/user/payment/error'; // Updated for local testing

  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    const { amount, trackId, customerIp, udf1, udf2, udf3, udf4, udf5 } =
      params;

    // Validate required customer IP
    if (!customerIp || customerIp === '127.0.0.1') {
      throw new Error(
        'Valid customer IP address is required for payment processing',
      );
    }

    const trandata: any = {
      amt: amount.toFixed(2),
      action: '1', // Purchase
      password: this.password,
      id: this.tranportalId,
      currencyCode: '682', // SAR
      trackId,
      responseURL: this.responseUrl,
      errorURL: this.errorUrl,
      langid: 'ar',
      udf1: udf1 || '',
      udf2: udf2 || '',
      udf3: udf3 || '',
      udf4: udf4 || '',
      udf5: udf5 || '',
    };

    // Only add terminalId if it exists
    if (this.terminalId) {
      trandata.terminalId = this.terminalId;
    }

    this.logger.log(
      `Creating payment with TrackID: ${trackId}, Amount: ${amount}, IP: ${customerIp}`,
    );

    // Encrypt the trandata
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
      const response = await axios.post<PaymentResponse>(
        this.paymentUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-FORWARDED-FOR': customerIp, // CRITICAL: Customer IP must be first
          },
          timeout: 30000,
        },
      );

      this.logger.debug('Payment response received', {
        status: response.data.status,
        hasResult: !!response.data.result,
      });

      // Check response status
      if (response.data.status === '2') {
        // Validation failed
        throw new Error(
          response.data.errorText ||
            `Payment validation failed: ${response.data.error}`,
        );
      }

      // Status '1' means success - result contains "paymentId:paymentURL"
      return response.data;
    } catch (error) {
      this.logger.error('Payment request failed', error.message);

      if (axios.isAxiosError(error) && error.response) {
        this.logger.error('Error details:', error.response.data);
      }

      throw error;
    }
  }
}
