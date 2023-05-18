import { CommandBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { CheckoutDto } from './interfaces/checkout.dto';
import { WebhookGuard } from 'src/guards/stripe-webhook.guard';
import { CreatePaymentCommand } from './use-cases/start-payment-process.use-case';
import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';
import { InjectPaypal } from 'src/@core/decorators/paypal.decorator';
import { ProcessPaymentCommand } from './use-cases/verify-payment-process.use-case';

@Controller('subscriptions')
export class SubscriptionsController {
  public constructor(
    private readonly commandBus: CommandBus,
    @InjectPaypal() private readonly paypal: PayPalHttpClient,
  ) {}

  @Post('checkout-session')
  public async createCheckoutSession(@Body() checkoutDto: CheckoutDto) {
    const { userId, priceId, paymentSystem, renew = false } = checkoutDto;

    const url = await this.commandBus.execute<
      CreatePaymentCommand,
      string | null
    >(new CreatePaymentCommand(paymentSystem, priceId, userId, renew));

    return url;
  }

  // @UseGuards(WebhookGuard)
  // @Post('/checkout-webhook')
  // public async checkoutWebhook(@Body() event: Stripe.Event) {
  //   if (event.type === 'checkout.session.completed') {
  //     if (
  //       (<Stripe.Checkout.Session>event.data.object).payment_status === 'paid'
  //     ) {
  //       // set payment to success to confirmed, update/create subscription
  //     } else {
  //       // Set payment status to rejected
  //     }
  //     console.log(<Stripe.Checkout.Session>event.data.object, 'event');
  //   }

  //   if (event.type === 'checkout.session.expired') {
  //     // TODO delete PENDING Payment
  //   }
  // }

  // @Post('/checkout-session-paypal')
  // public async createPaypalCheckoutSession(@Body() checkoutDto: CheckoutDto) {
  //   const { userId, priceId, renew } = checkoutDto;

  //   // priceId -> price value
  //   // renew === true -> billing plan | order

  //   const order = {
  //     intent: <CheckoutPaymentIntent>'CAPTURE',
  //     purchase_units: [
  //       {
  //         items: [
  //           {
  //             name: 'BusinessPlan',
  //             quantity: '1',
  //             unit_amount: {
  //               currency_code: 'USD',
  //               value: '10',
  //             },
  //           },
  //         ],
  //         amount: {
  //           currency_code: 'USD',
  //           value: '10',
  //           breakdown: {
  //             item_total: {
  //               currency_code: 'USD',
  //               value: '10',
  //             },
  //           },
  //         },
  //       },
  //     ],
  //     application_context: {
  //       // return_url: 'https://example.com/successUrl',
  //       // cancel_url: 'https://example.com/cancelUrl',
  //       return_url: 'http://localhost:3000?success=true',
  //       cancel_url: 'http://localhost:3000?cancel=true',
  //     },
  //   };

  //   if (renew) {
  //     const token = await this.paypalService.paypalClient.fetchAccessToken();
  //     const result = await fetch(
  //       'https://api-m.sandbox.paypal.com/v1/billing/subscriptions',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${(<any>token)._accessToken}`,
  //           'PayPal-Request-Id': '12345test_id',
  //           'PayPal-Client-Metadata-Id': '',
  //         },
  //         body: JSON.stringify({
  //           plan_id: 'P-94S73988AG6344329MRPVXEI',
  //           shipping_amount: {
  //             currency_code: 'USD',
  //             value: '10.00',
  //           },
  //           subscriber: {
  //             name: {
  //               given_name: 'FooBuyer',
  //               surname: 'Jones',
  //             },
  //             email_address: 'foobuyer@example.com',
  //           },
  //           application_context: {
  //             brand_name: 'INCTAGRAM',
  //             locale: 'en-US',
  //             shipping_preference: 'SET_PROVIDED_ADDRESS',
  //             user_action: 'SUBSCRIBE_NOW',
  //             payment_method: {
  //               payer_selected: 'PAYPAL',
  //               payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
  //             },
  //             return_url: 'http://localhost:3000?success=true',
  //             cancel_url: 'http://localhost:3000?success=true',
  //           },
  //         }),
  //       },
  //     ).then((res) => res.json());

  //     const redirectUrl = result.links.find(
  //       (link: Record<string, any>) => link.rel === 'approve',
  //     )?.href;

  //     return redirectUrl;
  //   }
  //   try {
  //     const request = new paypalCheckoutSdk.orders.OrdersCreateRequest();
  //     request.headers['Prefer'] = 'return=representation';
  //     (request as any).headers['PayPal-Request-Id'] = 'my_key';
  //     (request as any).headers['PayPal-Client-Metadata-Id'] = 'my_metadata_key';
  //     request.requestBody(order as any);

  //     const response = await this.paypalService.paypalClient.execute(request);
  //     const redirectUrl = response.result.links.find(
  //       (link: Record<string, any>) => link.rel === 'approve',
  //     )?.href;

  //     return redirectUrl;
  //   } catch (error) {
  //     console.log(error);

  //     throw new InternalServerErrorException();
  //   }
  // }

  @Post('/webhook')
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any, @Headers() headers: Record<string, any>) {
    console.log(headers);
    console.log(body);

    this.commandBus.execute(new ProcessPaymentCommand(body));
    // const token = await this.paypal.fetchAccessToken();
    // await fetch(
    //   'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${(<any>token)._accessToken}`,
    //     },
    //     body: JSON.stringify({
    //       auth_algo: headers['paypal-auth-algo'],
    //       cert_url: headers['paypal-cert-url'],
    //       transmission_id: headers['paypal-transmission-id'],
    //       transmission_sig: headers['paypal-transmission-sig'],
    //       transmission_time: headers['paypal-transmission-time'],
    //       webhook_id: '69K25271NJ644033K',
    //       webhook_event: JSON.parse(JSON.stringify(body)),
    //     }),
    //   },
    // )
    //   .then((res) => res.json())
    //   .then(console.log)
    //   .catch(console.log);

    // if (body.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    //   console.log(true);
    // }

    // const result = await fetch(
    //   `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${body.resource.id}/capture`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${(<any>token)._accessToken}`,
    //       'Content-Type': 'application/json',
    //       Accept: 'application/json',
    //     },
    //     body: JSON.stringify({
    //       note: 'Charging as the balance reached the limit',
    //       capture_type: 'OUTSTANDING_BALANCE',
    //       amount: { currency_code: 'USD', value: '10' },
    //     }),
    //   },
    // )
    //   .then((res) => res.json())
    //   .then(console.log);
    // console.log(
    //   await this.paypalService.paypalClient.execute(verificationRequest),
    //   'verification',
    // );
    // try {
    //   if (body?.resource?.status === 'APPROVED') {
    //     const token = await this.paypalService.paypalClient.fetchAccessToken();
    //     console.log(token);
    //     await fetch(
    //       'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
    //       {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${(<any>token)._accessToken}`,
    //         },
    //         body: JSON.stringify({
    //           auth_algo: headers['paypal-auth-algo'],
    //           cert_url: headers['paypal-cert-url'],
    //           transmission_id: headers['paypal-transmission-id'],
    //           transmission_sig: headers['paypal-transmission-sig'],
    //           transmission_time: headers['paypal-transmission-time'],
    //           webhook_id: '69K25271NJ644033K',
    //           webhook_event: JSON.parse(JSON.stringify(body)),
    //         }),
    //       },
    //     )
    //       .then((res) => res.json())
    //       .then(console.log)
    //       .catch(console.log);

    // const request = new paypalSdk.orders.OrdersCaptureRequest(body.resource.id);
    // const response = await this.paypal.execute(request);
    // console.log(`Response: ${JSON.stringify(response)}`);
    // //     // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    // console.log(`Capture: ${JSON.stringify(response.result)}`);
    //   }
    // } catch (error) {
    // error handling
    // rejecting order
    // }
  }
}
