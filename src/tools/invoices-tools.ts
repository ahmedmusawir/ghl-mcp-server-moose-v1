import { z } from "zod";
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  // Invoice Template Types
  CreateInvoiceTemplateDto,
  CreateInvoiceTemplateResponseDto,
  UpdateInvoiceTemplateDto,
  UpdateInvoiceTemplateResponseDto,
  DeleteInvoiceTemplateResponseDto,
  ListTemplatesResponse,
  InvoiceTemplate,
  UpdateInvoiceLateFeesConfigurationDto,
  UpdatePaymentMethodsConfigurationDto,
  
  // Invoice Schedule Types
  CreateInvoiceScheduleDto,
  CreateInvoiceScheduleResponseDto,
  UpdateInvoiceScheduleDto,
  UpdateInvoiceScheduleResponseDto,
  DeleteInvoiceScheduleResponseDto,
  ListSchedulesResponse,
  GetScheduleResponseDto,
  ScheduleInvoiceScheduleDto,
  ScheduleInvoiceScheduleResponseDto,
  AutoPaymentScheduleDto,
  AutoPaymentInvoiceScheduleResponseDto,
  CancelInvoiceScheduleDto,
  CancelInvoiceScheduleResponseDto,
  UpdateAndScheduleInvoiceScheduleResponseDto,
  
  // Invoice Types
  CreateInvoiceDto,
  CreateInvoiceResponseDto,
  UpdateInvoiceDto,
  UpdateInvoiceResponseDto,
  DeleteInvoiceResponseDto,
  GetInvoiceResponseDto,
  ListInvoicesResponseDto,
  VoidInvoiceDto,
  VoidInvoiceResponseDto,
  SendInvoiceDto,
  SendInvoicesResponseDto,
  RecordPaymentDto,
  RecordPaymentResponseDto,
  Text2PayDto,
  Text2PayInvoiceResponseDto,
  GenerateInvoiceNumberResponse,
  PatchInvoiceStatsLastViewedDto,
  
  // Estimate Types
  CreateEstimatesDto,
  EstimateResponseDto,
  UpdateEstimateDto,
  SendEstimateDto,
  CreateInvoiceFromEstimateDto,
  CreateInvoiceFromEstimateResponseDto,
  ListEstimatesResponseDto,
  EstimateIdParam,
  GenerateEstimateNumberResponse,
  EstimateTemplatesDto,
  EstimateTemplateResponseDto,
  ListEstimateTemplateResponseDto,
  AltDto
} from '../types/ghl-types.js';

export class InvoicesTools {
  private client: GHLApiClient;

  constructor(client: GHLApiClient) {
    this.client = client;
  }

  getToolDefinitions(): any[] {
    return [
      // Invoice Template Tools
      {
        name: 'create_invoice_template',
        description: `Create a reusable invoice template.

Build professional invoice templates for recurring billing scenarios.

Use Cases:
- Create templates for monthly services
- Standardize invoice formatting
- Save time on recurring invoices
- Maintain brand consistency
- Pre-configure payment terms

Template Components:
- **name**: Internal template identifier
- **title**: Customer-facing invoice title
- **currency**: Billing currency (USD, EUR, etc.)
- **issueDate**: When invoice is generated
- **dueDate**: Payment deadline

Examples:
- Monthly service: {name: "Monthly Hosting", title: "Web Hosting Invoice", currency: "USD"}
- Consulting: {name: "Consulting Template", title: "Professional Services", dueDate: "Net 30"}

💡 Best Practices:
- Use descriptive template names
- Set clear payment terms
- Include all necessary line items
- Test template before using

Returns: Created template with ID.

Related Tools: list_invoice_templates, update_invoice_template, delete_invoice_template`,
        inputSchema: {
          altId: z.string().describe('Location ID'),
          altType: z.enum(['location']).optional().describe('Type of identifier (location)'),
          name: z.string().describe('Template name (internal identifier)'),
          title: z.string().optional().describe('Invoice title (customer-facing)'),
          currency: z.string().optional().describe('Currency code (USD, EUR, GBP, etc.)'),
          issueDate: z.string().optional().describe('Default issue date'),
          dueDate: z.string().optional().describe('Default due date or payment terms')
        }
      },
      {
        name: 'list_invoice_templates',
        description: `List all invoice templates with filtering.

View and manage your invoice templates.

Use Cases:
- Browse all templates
- Search for specific templates
- Filter by status or payment mode
- Audit template usage

Filtering Options:
- **status**: Filter by template status
- **search**: Search by template name
- **paymentMode**: Filter by live/test mode

Pagination:
- limit: Templates per page (default: 10)
- offset: Skip N templates

Returns: Array of invoice templates.

Related Tools: create_invoice_template, get_invoice_template`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          limit: z.string().optional().describe('Templates per page (default: 10)'),
          offset: z.string().optional().describe('Number to skip (pagination)'),
          status: z.string().optional().describe('Filter by status'),
          search: z.string().optional().describe('Search by template name'),
          paymentMode: z.enum(['default', 'live', 'test']).optional().describe('Payment mode filter')
        }
      },
      {
        name: 'get_invoice_template',
        description: `Get complete details for an invoice template.

Retrieve full template configuration and settings.

Use Cases:
- View template details
- Review template configuration
- Copy template settings
- Verify template before use

What You Get:
- Template name and title
- Currency settings
- Payment terms
- Line items configuration
- All template settings

Returns: Complete template object.

Related Tools: list_invoice_templates, update_invoice_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to retrieve'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'update_invoice_template',
        description: `Update an existing invoice template.

Modify template settings and configuration.

Use Cases:
- Update template name or title
- Change currency settings
- Modify payment terms
- Update line items
- Adjust template configuration

What You Can Update:
- Template name
- Invoice title
- Currency
- Payment terms
- All template settings

Returns: Updated template.

Related Tools: get_invoice_template, create_invoice_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to update'),
          altId: z.string().optional().describe('Location ID'),
          name: z.string().optional().describe('Template name'),
          title: z.string().optional().describe('Invoice title'),
          currency: z.string().optional().describe('Currency code')
        }
      },
      {
        name: 'delete_invoice_template',
        description: `Delete an invoice template permanently.

⚠️ WARNING: This action cannot be undone!

Use Cases:
- Remove unused templates
- Clean up old templates
- Delete test templates

What Happens:
- Template is permanently deleted
- Cannot be recovered
- Active invoices using template are not affected

💡 Best Practice: Export template data before deleting.

Returns: Confirmation of deletion.

Related Tools: list_invoice_templates, create_invoice_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to delete'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'update_invoice_template_late_fees',
        description: `Configure late fee settings for invoice template.

Automate late payment penalties.

Use Cases:
- Set late payment fees
- Configure grace periods
- Automate penalty charges

Returns: Updated template with late fee configuration.

Related Tools: create_invoice_template, update_invoice_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID'),
          altId: z.string().optional().describe('Location ID'),
          enabled: z.boolean().describe('Enable/disable late fees'),
          feeType: z.enum(['percentage', 'fixed']).optional().describe('Fee type'),
          feeAmount: z.number().optional().describe('Fee amount or percentage'),
          gracePeriodDays: z.number().optional().describe('Days before late fee applies')
        }
      },
      {
        name: 'update_invoice_template_payment_methods',
        description: `Configure accepted payment methods for template.

Set available payment options for invoices.

Use Cases:
- Enable credit card payments
- Configure ACH/bank transfers
- Set payment gateway options

Returns: Updated template with payment methods.

Related Tools: create_invoice_template, update_invoice_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID'),
          altId: z.string().optional().describe('Location ID'),
          creditCard: z.boolean().optional().describe('Accept credit cards'),
          ach: z.boolean().optional().describe('Accept ACH/bank transfers'),
          cash: z.boolean().optional().describe('Accept cash payments'),
          check: z.boolean().optional().describe('Accept check payments')
        }
      },

      // Invoice Schedule Tools
      {
        name: 'create_invoice_schedule',
        description: `Create a recurring invoice schedule.

Automate invoice generation with recurring schedules.

Use Cases:
- Monthly subscription billing
- Recurring service invoices
- Automated payment reminders
- Scheduled billing cycles

Frequency Options:
- daily, weekly, monthly, quarterly, yearly

Returns: Created schedule with ID.

Related Tools: list_invoice_schedules, update_invoice_schedule, schedule_invoice_schedule`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          name: z.string().describe('Schedule name'),
          templateId: z.string().describe('Invoice template ID'),
          contactId: z.string().describe('Contact ID to bill'),
          frequency: z.string().optional().describe('Billing frequency (daily, weekly, monthly, etc.)')
        }
      },
      {
        name: 'list_invoice_schedules',
        description: `List all recurring invoice schedules.

View and manage automated billing schedules.

Use Cases:
- Monitor active schedules
- Review billing automation
- Filter by status

Returns: Array of invoice schedules.

Related Tools: create_invoice_schedule, get_invoice_schedule`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          limit: z.string().optional().describe('Schedules per page (default: 10)'),
          offset: z.string().optional().describe('Pagination offset'),
          status: z.string().optional().describe('Filter by status'),
          search: z.string().optional().describe('Search schedules')
        }
      },
      {
        name: 'get_invoice_schedule',
        description: `Get recurring invoice schedule details.

Retrieve full schedule configuration.

Returns: Complete schedule object.

Related Tools: list_invoice_schedules, update_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'update_invoice_schedule',
        description: `Update a recurring invoice schedule.

Modify schedule settings and frequency.

Use Cases:
- Change billing frequency
- Update schedule name
- Modify template

Returns: Updated schedule.

Related Tools: get_invoice_schedule, schedule_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID to update'),
          altId: z.string().optional().describe('Location ID'),
          name: z.string().optional().describe('Schedule name'),
          templateId: z.string().optional().describe('Invoice template ID'),
          frequency: z.string().optional().describe('Billing frequency')
        }
      },
      {
        name: 'delete_invoice_schedule',
        description: `Delete a recurring invoice schedule.

⚠️ WARNING: This stops automated billing!

Use Cases:
- Cancel recurring billing
- Remove old schedules

Returns: Confirmation of deletion.

Related Tools: list_invoice_schedules, cancel_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID to delete'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'schedule_invoice_schedule',
        description: `Activate/schedule an invoice schedule.

Start automated invoice generation.

Use Cases:
- Activate new schedule
- Resume paused schedule

Returns: Scheduled invoice schedule.

Related Tools: create_invoice_schedule, cancel_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID to activate'),
          altId: z.string().optional().describe('Location ID'),
          startDate: z.string().optional().describe('Start date for schedule')
        }
      },
      {
        name: 'auto_payment_invoice_schedule',
        description: `Enable automatic payment for invoice schedule.

Automate payment collection for recurring invoices.

Use Cases:
- Enable auto-charge
- Set up automatic billing

Returns: Updated schedule with auto-payment enabled.

Related Tools: schedule_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID'),
          altId: z.string().optional().describe('Location ID'),
          enabled: z.boolean().describe('Enable/disable auto-payment')
        }
      },
      {
        name: 'cancel_invoice_schedule',
        description: `Cancel a recurring invoice schedule.

Stop automated invoice generation without deleting.

Use Cases:
- Pause recurring billing
- Temporarily stop invoices

Returns: Canceled schedule (can be reactivated).

Related Tools: schedule_invoice_schedule, delete_invoice_schedule`,
        inputSchema: {
          scheduleId: z.string().describe('Schedule ID to cancel'),
          altId: z.string().optional().describe('Location ID')
        }
      },

      // Invoice Management Tools
      {
        name: 'create_invoice',
        description: `Create a new invoice for a customer.

Generate professional invoices for products and services.

Use Cases:
- Bill customers for services
- One-time product sales
- Custom invoicing

Returns: Created invoice with ID.

Related Tools: list_invoices, send_invoice, record_invoice_payment`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          contactId: z.string().describe('Contact ID to bill'),
          title: z.string().describe('Invoice title'),
          currency: z.string().optional().describe('Currency code (USD, EUR, etc.)'),
          issueDate: z.string().optional().describe('Issue date'),
          dueDate: z.string().optional().describe('Payment due date'),
          items: z.array(z.any()).optional().describe('Invoice line items')
        }
      },
      {
        name: 'list_invoices',
        description: `List all invoices with filtering.

View and manage customer invoices.

Use Cases:
- Browse all invoices
- Filter by status (paid, unpaid, overdue)
- Search by customer

Returns: Array of invoices.

Related Tools: create_invoice, get_invoice`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          limit: z.string().optional().describe('Invoices per page (default: 10)'),
          offset: z.string().optional().describe('Pagination offset'),
          status: z.string().optional().describe('Filter by status'),
          contactId: z.string().optional().describe('Filter by contact'),
          search: z.string().optional().describe('Search invoices')
        }
      },
      {
        name: 'get_invoice',
        description: `Get complete invoice details.

Retrieve full invoice information.

Returns: Complete invoice object.

Related Tools: list_invoices, update_invoice`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'update_invoice',
        description: `Update an existing invoice.

Modify invoice details before sending.

Use Cases:
- Update invoice items
- Change due date
- Modify amounts

Returns: Updated invoice.

Related Tools: get_invoice, send_invoice`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID to update'),
          altId: z.string().optional().describe('Location ID'),
          title: z.string().optional().describe('Invoice title'),
          currency: z.string().optional().describe('Currency code'),
          dueDate: z.string().optional().describe('Due date'),
          items: z.array(z.any()).optional().describe('Invoice items')
        }
      },
      {
        name: 'delete_invoice',
        description: `Delete an invoice permanently.

⚠️ WARNING: This action cannot be undone!

Use Cases:
- Remove draft invoices
- Delete incorrect invoices

Returns: Confirmation of deletion.

Related Tools: void_invoice (for sent invoices)`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID to delete'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'void_invoice',
        description: `Void a sent invoice.

Cancel an invoice without deleting (maintains record).

Use Cases:
- Cancel sent invoices
- Maintain audit trail
- Reverse billing errors

Returns: Voided invoice.

Related Tools: delete_invoice, record_invoice_payment`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID to void'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'send_invoice',
        description: `Send invoice to customer via email.

Deliver invoice with payment link.

Use Cases:
- Email invoice to customer
- Send payment reminders
- Resend invoices

Returns: Confirmation of send.

Related Tools: create_invoice, text2pay_invoice`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID to send'),
          altId: z.string().optional().describe('Location ID'),
          emailTo: z.string().optional().describe('Recipient email'),
          subject: z.string().optional().describe('Email subject'),
          message: z.string().optional().describe('Email message')
        }
      },
      {
        name: 'record_invoice_payment',
        description: `Record a manual payment for an invoice.

Log offline or external payments.

Use Cases:
- Record cash payments
- Log check payments
- Manual payment entry

Returns: Updated invoice with payment recorded.

Related Tools: get_invoice, list_invoices`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID'),
          altId: z.string().optional().describe('Location ID'),
          amount: z.number().describe('Payment amount'),
          paymentMethod: z.string().optional().describe('Payment method (cash, check, etc.)'),
          date: z.string().optional().describe('Payment date')
        }
      },
      {
        name: 'generate_invoice_number',
        description: `Generate unique invoice number.

Create sequential invoice numbers.

Use Cases:
- Get next invoice number
- Maintain invoice numbering

Returns: Next available invoice number.

Related Tools: create_invoice`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'text2pay_invoice',
        description: `Send invoice via SMS with payment link.

Deliver invoice through text message.

Use Cases:
- SMS invoice delivery
- Quick payment requests
- Mobile-first billing

Returns: Confirmation of SMS sent.

Related Tools: send_invoice`,
        inputSchema: {
          invoiceId: z.string().describe('Invoice ID'),
          altId: z.string().optional().describe('Location ID'),
          phoneNumber: z.string().optional().describe('Customer phone number'),
          message: z.string().optional().describe('SMS message')
        }
      },

      // Estimate Tools
      {
        name: 'create_estimate',
        description: `Create a new estimate/quote for a customer.

Provide pricing quotes before invoicing.

Use Cases:
- Send project quotes
- Provide service estimates
- Pre-sale pricing

Returns: Created estimate with ID.

Related Tools: send_estimate, create_invoice_from_estimate`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          contactId: z.string().describe('Contact ID'),
          title: z.string().describe('Estimate title'),
          currency: z.string().optional().describe('Currency code'),
          issueDate: z.string().optional().describe('Issue date'),
          validUntil: z.string().optional().describe('Expiration date')
        }
      },
      {
        name: 'list_estimates',
        description: `List all estimates with filtering.

View and manage customer estimates.

Use Cases:
- Browse all estimates
- Filter by status (draft, sent, accepted, declined)
- Track estimate conversions

Returns: Array of estimates.

Related Tools: create_estimate, get_estimate`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          limit: z.string().optional().describe('Estimates per page (default: 10)'),
          offset: z.string().optional().describe('Pagination offset'),
          status: z.enum(['all', 'draft', 'sent', 'accepted', 'declined', 'invoiced', 'viewed']).optional().describe('Filter by status'),
          contactId: z.string().optional().describe('Filter by contact'),
          search: z.string().optional().describe('Search estimates')
        }
      },
      {
        name: 'get_estimate',
        description: `Get complete estimate details.

Retrieve full estimate information.

Returns: Complete estimate object.

Related Tools: list_estimates, update_estimate`,
        inputSchema: {
          estimateId: z.string().describe('Estimate ID'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'update_estimate',
        description: `Update an existing estimate.

Modify estimate details before sending.

Use Cases:
- Update pricing
- Change expiration date
- Modify items

Returns: Updated estimate.

Related Tools: get_estimate, send_estimate`,
        inputSchema: {
          estimateId: z.string().describe('Estimate ID to update'),
          altId: z.string().optional().describe('Location ID'),
          title: z.string().optional().describe('Estimate title'),
          currency: z.string().optional().describe('Currency code'),
          validUntil: z.string().optional().describe('Expiration date')
        }
      },
      {
        name: 'delete_estimate',
        description: `Delete an estimate permanently.

⚠️ WARNING: This action cannot be undone!

Use Cases:
- Remove draft estimates
- Delete incorrect estimates

Returns: Confirmation of deletion.

Related Tools: list_estimates`,
        inputSchema: {
          estimateId: z.string().describe('Estimate ID to delete'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'send_estimate',
        description: `Send estimate to customer via email.

Deliver quote with acceptance link.

Use Cases:
- Email estimate to customer
- Send pricing quotes
- Follow up on estimates

Returns: Confirmation of send.

Related Tools: create_estimate, create_invoice_from_estimate`,
        inputSchema: {
          estimateId: z.string().describe('Estimate ID to send'),
          altId: z.string().optional().describe('Location ID'),
          emailTo: z.string().optional().describe('Recipient email'),
          subject: z.string().optional().describe('Email subject'),
          message: z.string().optional().describe('Email message')
        }
      },
      {
        name: 'create_invoice_from_estimate',
        description: `Convert accepted estimate to invoice.

Turn approved quotes into billable invoices.

Use Cases:
- Convert accepted estimates
- Bill approved quotes
- Streamline quote-to-invoice

Returns: Created invoice from estimate.

Related Tools: send_estimate, create_invoice`,
        inputSchema: {
          estimateId: z.string().describe('Estimate ID to convert'),
          altId: z.string().optional().describe('Location ID'),
          issueDate: z.string().optional().describe('Invoice issue date'),
          dueDate: z.string().optional().describe('Invoice due date')
        }
      },
      {
        name: 'generate_estimate_number',
        description: `Generate unique estimate number.

Create sequential estimate numbers.

Use Cases:
- Get next estimate number
- Maintain estimate numbering

Returns: Next available estimate number.

Related Tools: create_estimate`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID')
        }
      },

      // Estimate Template Tools
      {
        name: 'list_estimate_templates',
        description: `List all estimate templates.

View and manage estimate templates.

Use Cases:
- Browse all estimate templates
- Find template for quotes
- Audit template usage

Returns: Array of estimate templates.

Related Tools: create_estimate_template, get_estimate_template`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          limit: z.string().optional().describe('Templates per page (default: 10)'),
          offset: z.string().optional().describe('Pagination offset')
        }
      },
      {
        name: 'get_estimate_template',
        description: `Get complete details for an estimate template.

Retrieve full template configuration.

Use Cases:
- View template details
- Review template configuration
- Copy template settings

Returns: Complete estimate template object.

Related Tools: list_estimate_templates, update_estimate_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to retrieve'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'create_estimate_template',
        description: `Create a reusable estimate template.

Build professional estimate templates for quotes.

Use Cases:
- Create templates for common quotes
- Standardize estimate formatting
- Save time on recurring estimates

Returns: Created estimate template with ID.

Related Tools: list_estimate_templates, update_estimate_template`,
        inputSchema: {
          altId: z.string().optional().describe('Location ID'),
          name: z.string().describe('Template name'),
          title: z.string().optional().describe('Estimate title'),
          currency: z.string().optional().describe('Currency code'),
          validityDays: z.number().optional().describe('Days estimate is valid')
        }
      },
      {
        name: 'update_estimate_template',
        description: `Update an existing estimate template.

Modify template settings and configuration.

Use Cases:
- Update template name or title
- Change currency settings
- Modify validity period

Returns: Updated estimate template.

Related Tools: get_estimate_template, create_estimate_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to update'),
          altId: z.string().optional().describe('Location ID'),
          name: z.string().optional().describe('Template name'),
          title: z.string().optional().describe('Estimate title'),
          currency: z.string().optional().describe('Currency code')
        }
      },
      {
        name: 'delete_estimate_template',
        description: `Delete an estimate template permanently.

⚠️ WARNING: This action cannot be undone!

Use Cases:
- Remove unused templates
- Clean up old templates

Returns: Confirmation of deletion.

Related Tools: list_estimate_templates`,
        inputSchema: {
          templateId: z.string().describe('Template ID to delete'),
          altId: z.string().optional().describe('Location ID')
        }
      },
      {
        name: 'preview_estimate_template',
        description: `Preview an estimate template.

View how template will appear to customers.

Use Cases:
- Review template before using
- Check formatting and layout
- Verify template content

Returns: Template preview/rendering.

Related Tools: create_estimate_template, update_estimate_template`,
        inputSchema: {
          templateId: z.string().describe('Template ID to preview'),
          altId: z.string().optional().describe('Location ID')
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      // Invoice Template Handlers
      case 'create_invoice_template':
        return this.client.createInvoiceTemplate(args as CreateInvoiceTemplateDto);

      case 'list_invoice_templates':
        return this.client.listInvoiceTemplates(args);

      case 'get_invoice_template':
        return this.client.getInvoiceTemplate(args.templateId, args);

      case 'update_invoice_template':
        const { templateId: updateTemplateId, ...updateTemplateData } = args;
        return this.client.updateInvoiceTemplate(updateTemplateId, updateTemplateData as UpdateInvoiceTemplateDto);

      case 'delete_invoice_template':
        return this.client.deleteInvoiceTemplate(args.templateId, args);

      case 'update_invoice_template_late_fees':
        const { templateId: lateFeesTemplateId, ...lateFeesData } = args;
        return this.client.updateInvoiceTemplateLateFeesConfiguration(lateFeesTemplateId, lateFeesData as UpdateInvoiceLateFeesConfigurationDto);

      case 'update_invoice_template_payment_methods':
        const { templateId: paymentMethodsTemplateId, ...paymentMethodsData } = args;
        return this.client.updateInvoiceTemplatePaymentMethodsConfiguration(paymentMethodsTemplateId, paymentMethodsData as UpdatePaymentMethodsConfigurationDto);

      // Invoice Schedule Handlers
      case 'create_invoice_schedule':
        return this.client.createInvoiceSchedule(args as CreateInvoiceScheduleDto);

      case 'list_invoice_schedules':
        return this.client.listInvoiceSchedules(args);

      case 'get_invoice_schedule':
        return this.client.getInvoiceSchedule(args.scheduleId, args);

      case 'update_invoice_schedule':
        const { scheduleId: updateScheduleId, ...updateScheduleData } = args;
        return this.client.updateInvoiceSchedule(updateScheduleId, updateScheduleData as UpdateInvoiceScheduleDto);

      case 'delete_invoice_schedule':
        return this.client.deleteInvoiceSchedule(args.scheduleId, args);

      case 'schedule_invoice_schedule':
        const { scheduleId: scheduleScheduleId, ...scheduleScheduleData } = args;
        return this.client.scheduleInvoiceSchedule(scheduleScheduleId, scheduleScheduleData as ScheduleInvoiceScheduleDto);

      case 'auto_payment_invoice_schedule':
        const { scheduleId: autoPaymentScheduleId, ...autoPaymentData } = args;
        return this.client.autoPaymentInvoiceSchedule(autoPaymentScheduleId, autoPaymentData as AutoPaymentScheduleDto);

      case 'cancel_invoice_schedule':
        const { scheduleId: cancelScheduleId, ...cancelScheduleData } = args;
        return this.client.cancelInvoiceSchedule(cancelScheduleId, cancelScheduleData as CancelInvoiceScheduleDto);

      // Invoice Management Handlers
      case 'create_invoice':
        return this.client.createInvoice(args as CreateInvoiceDto);

      case 'list_invoices':
        return this.client.listInvoices(args);

      case 'get_invoice':
        return this.client.getInvoice(args.invoiceId, args);

      case 'update_invoice':
        const { invoiceId: updateInvoiceId, ...updateInvoiceData } = args;
        return this.client.updateInvoice(updateInvoiceId, updateInvoiceData as UpdateInvoiceDto);

      case 'delete_invoice':
        return this.client.deleteInvoice(args.invoiceId, args);

      case 'void_invoice':
        const { invoiceId: voidInvoiceId, ...voidInvoiceData } = args;
        return this.client.voidInvoice(voidInvoiceId, voidInvoiceData as VoidInvoiceDto);

      case 'send_invoice':
        const { invoiceId: sendInvoiceId, ...sendInvoiceData } = args;
        return this.client.sendInvoice(sendInvoiceId, sendInvoiceData as SendInvoiceDto);

      case 'record_invoice_payment':
        const { invoiceId: recordPaymentInvoiceId, ...recordPaymentData } = args;
        return this.client.recordInvoicePayment(recordPaymentInvoiceId, recordPaymentData as RecordPaymentDto);

      case 'text2pay_invoice':
        return this.client.text2PayInvoice(args as Text2PayDto);

      // Estimate Handlers
      case 'create_estimate':
        return this.client.createEstimate(args as CreateEstimatesDto);

      case 'list_estimates':
        return this.client.listEstimates(args);

      case 'get_estimate':
        throw new Error('get_estimate: API method not yet implemented in GHL client');

      case 'update_estimate':
        throw new Error('update_estimate: API method not yet implemented in GHL client');

      case 'delete_estimate':
        throw new Error('delete_estimate: API method not yet implemented in GHL client');

      case 'send_estimate':
        const { estimateId: sendEstimateId, ...sendEstimateData } = args;
        return this.client.sendEstimate(sendEstimateId, sendEstimateData as SendEstimateDto);

      case 'create_invoice_from_estimate':
        const { estimateId: invoiceFromEstimateId, ...invoiceFromEstimateData } = args;
        return this.client.createInvoiceFromEstimate(invoiceFromEstimateId, invoiceFromEstimateData as CreateInvoiceFromEstimateDto);

      // Utility Handlers
      case 'generate_invoice_number':
        return this.client.generateInvoiceNumber(args);

      case 'generate_estimate_number':
        return this.client.generateEstimateNumber(args);

      // Estimate Template Handlers
      case 'list_estimate_templates':
        return this.client.listEstimateTemplates(args);

      case 'get_estimate_template':
        throw new Error('get_estimate_template: API method not yet implemented in GHL client');

      case 'create_estimate_template':
        return this.client.createEstimateTemplate(args as EstimateTemplatesDto);

      case 'update_estimate_template':
        throw new Error('update_estimate_template: API method not yet implemented in GHL client');

      case 'delete_estimate_template':
        throw new Error('delete_estimate_template: API method not yet implemented in GHL client');

      case 'preview_estimate_template':
        return this.client.previewEstimateTemplate(args.templateId);

      default:
        throw new Error(`Unknown invoices tool: ${name}`);
    }
  }
} 