declare module 'paypal-rest-sdk' {
  namespace core {
    class AccessToken {}
    class AccessTokenRequest {}
    class PayPalEnvironment extends Environment {}
    class LiveEnvironment extends PayPalEnvironment {}
    class SandboxEnvironment extends PayPalEnvironment {}
    class PayPalHttpClient extends HttpClient {}
    class RefreshTokenRequest {}
    class TokenCache {}
  }

  class Environment {
    constructor(
      public readonly client_id: string,
      public readonly client_secret: string,
    ) {}
  }

  namespace v1 {
    namespace billingAgreements {
      class AgreementBillBalanceRequest {}
      class AgreementCancelRequest {}
      class AgreementCreateRequest {}
      class AgreementExecuteRequest {}
      class AgreementGetRequest {}
      class AgreementReActivateRequest {}
      class AgreementSetBalanceRequest {}
      class AgreementSuspendRequest {}
      class AgreementTransactionsRequest {}
      class AgreementUpdateRequest {}
    }

    namespace billingPlans {
      class PlanCreateRequest {}
      class PlanGetRequest {}
      class PlanListRequest {}
      class PlanUpdateRequest {}
    }

    namespace customerDisputes {
      class DisputeAcceptClaimRequest {}
      class DisputeAdjudicateRequest {}
      class DisputeAppealRequest {}
      class DisputeGetRequest {}
      class DisputeListRequest {}
      class DisputeProvideEvidenceRequest {}
      class DisputeRequireEvidenceRequest {}
    }

    namespace identity {
      class UserinfoGetRequest {}
      class UserConsent {}
    }

    namespace invoices {
      class InvoiceCancelRequest {}
      class InvoiceCreateRequest {}
      class InvoiceDeleteExternalPaymentRequest {}
      class InvoiceDeleteExternalRefundRequest {}
      class InvoiceDeleteRequest {}
      class InvoiceGetRequest {}
      class InvoiceListRequest {}
      class InvoiceNextInvoiceNumberRequest {}
      class InvoiceQrCodeRequest {}
      class InvoiceRecordPaymentRequest {}
      class InvoiceRecordRefundRequest {}
      class InvoiceRemindRequest {}
      class InvoiceSearchRequest {}
      class InvoiceSendRequest {}
      class InvoiceUpdateRequest {}
      class TemplateCreateRequest {}
      class TemplateDeleteRequest {}
      class TemplateGetRequest {}
      class TemplateListRequest {}
      class TemplateUpdateRequest {}
    }

    namespace orders {
      class OrdersCancelRequest {}
      class OrdersCreateRequest {}
      class OrdersGetRequest {}
      class OrdersPayRequest {}
    }

    namespace paymentExperience {
      class WebProfileCreateRequest {}
      class WebProfileDeleteRequest {}
      class WebProfileGetRequest {}
      class WebProfileListRequest {}
      class WebProfilePartialUpdateRequest {}
      class WebProfileUpdateRequest {}
    }

    namespace payments {
      class AuthorizationCaptureRequest {}
      class AuthorizationGetRequest {}
      class AuthorizationReauthorizeRequest {}
      class AuthorizationVoidRequest {}
      class CaptureGetRequest {}
      class CaptureRefundRequest {}
      class OrderAuthorizeRequest {}
      class OrderCaptureRequest {}
      class OrderGetRequest {}
      class OrderVoidRequest {}
      class PaymentCreateRequest {}
      class PaymentExecuteRequest {}
      class PaymentGetRequest {}
      class PaymentListRequest {}
      class PaymentUpdateRequest {}
      class RefundGetRequest {}
      class SaleGetRequest {}
      class SaleRefundRequest {}
    }

    namespace sync {
      class SearchGetRequest {}
    }

    namespace vault {
      class CreditCardCreateRequest {}
      class CreditCardDeleteRequest {}
      class CreditCardGetRequest {}
      class CreditCardListRequest {}
      class CreditCardUpdateRequest {}
    }

    namespace webhooks {
      class AvailableEventTypeListRequest {}
      class EventGetRequest {}
      class EventListRequest {}
      class EventResendRequest {}
      class SimulateEventRequest {}
      class WebhookCreateRequest {}
      class WebhookDeleteRequest {}
      class WebhookGetRequest {}
      class WebhookListEventSubscriptionsRequest {}
      class WebhookListRequest {}
      class WebhookUpdateRequest {}
      class WebhookVerifySignatureRequest {}
    }
  }
}
