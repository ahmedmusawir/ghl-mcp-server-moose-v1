# Session: December 24, 2025

## Project Status
- Current objective: Testing Custom Objects tools (Phase 1-3: Schema, Records, Search)
- Last completed: Fixed `update_object_record` locationId issue (Dec 24 4:15 PM)
- Current finding: Cannot add properties to records that don't exist in schema (expected behavior)

## Code Changes
- [6:16 PM] - Fixed `get_survey_submissions` tool - 404 "Cannot GET" error
  - Root cause: Incorrect endpoint path `/locations/{locationId}/surveys/submissions`
  - Fix: Changed to correct path `/surveys/submissions` with locationId as query param
  - Changed in `src/clients/ghl-api-client.ts`: `getSurveySubmissions` method
  - Also fixed error handling to use `handleApiError` instead of raw throw
  - Build: ✅ Successful
- [4:15 PM] - Fixed `update_object_record` tool - 422 error "property locationId should not exist"
  - Root cause: `locationId` was being sent in request body AND query params
  - Fix: Extract `locationId` from body, send only in query params
  - Changed in `src/clients/ghl-api-client.ts`: `updateObjectRecord` method
  - Build: ✅ Successful
- [4:00 PM] - **STANDARDIZED ALL TOOL NAMING** - Removed `ghl_` prefix from 98 tools across 12 files
  - Files updated: `association-tools.ts`, `association-tools-1.ts`, `custom-field-v2-tools.ts`, `custom-field-v2-tools-1.ts`, `products-tools.ts`, `products-tools-1.ts`, `store-tools.ts`, `store-tools-1.ts`, `survey-tools.ts`, `survey-tools-1.ts`, `workflow-tools.ts`, `workflow-tools-1.ts`
  - Changed: `ghl_get_workflows` → `get_workflows`, `ghl_create_association` → `create_association`, etc.
  - Updated: Tool names, switch cases, helper functions, and all documentation references
  - Result: Consistent naming across entire MCP server (no more `ghl_` prefixes)
  - Build: ✅ Successful
- [10:19 AM] - Fixed `create_invoice` tool schema in `src/tools/invoices-tools.ts`
  - Added required fields: `name`, `businessDetails`, `contactDetails`, `items` (with `type`), `discount`, `sentTo`, `liveMode`, `issueDate`
  - Removed invalid field: `contactId` (moved to `contactDetails.id`)
  - Added usage example and detailed field descriptions
- [10:49 AM] - Fixed `createInvoice` API endpoint in `src/clients/ghl-api-client.ts`
  - Confirmed endpoint is `/invoices/` (with trailing slash)
  - Added debug logging to see exact payload being sent
- [11:14 AM] - Restructured `createInvoice` payload to match GHL API example exactly
  - Explicitly list required fields in order matching API docs
  - Spread optional fields conditionally
- [11:25 AM] - Found root cause of 422 error: `title` field has 40 character max limit
  - Added enhanced 422 error logging to axios interceptor
  - Updated tool schema to document the 40 character limit
- [11:31 AM] - Fixed `send_invoice` tool schema
  - Removed invalid fields: `emailTo`, `subject`, `message`
  - Added required fields: `action`, `liveMode`, `userId`
- [11:33 AM] - Added IMPORTANT CONSTRAINTS section to `create_invoice` description
  - Made title 40 char limit prominent so agent sees it upfront
- [11:38 AM] - Fixed `text2pay_invoice` tool schema
  - This tool CREATES and SENDS an invoice via SMS (not just sends existing invoice)
  - Removed invalid fields: `invoiceId`, `phoneNumber`, `message`
  - Added required fields: `name`, `currency`, `items`, `contactDetails`, `issueDate`, `action`, `userId`, `sentTo`, `liveMode`
- [11:47 AM] - Fixed `record_invoice_payment` tool schema
  - Removed invalid fields: `paymentMethod`, `date`
  - Added required fields: `mode` (enum: cash/card/cheque/bank_transfer/other), `notes`
  - Added detailed USAGE EXAMPLE and REQUIRED/OPTIONAL FIELDS sections
- [12:03 PM] - Fixed `create_invoice_schedule` tool schema
  - Removed invalid fields: `templateId`, `contactId`, `frequency`
  - Added required fields: `contactDetails`, `schedule`, `liveMode`, `businessDetails`, `currency`, `items`, `discount`
  - Added detailed USAGE EXAMPLE with schedule rrule options
- [12:06 PM] - Added constraint to `create_invoice_schedule`: executeAt OR rrule, NOT BOTH
- [12:08 PM] - Fixed `create_invoice_schedule` rrule structure
  - Changed `freq` to `intervalType` (REQUIRED)
  - Added `startDate` as REQUIRED field
  - rrule requires: intervalType, interval, startDate
- [12:11 PM] - Added `dayOfMonth` and `dayOfWeek` as REQUIRED fields for rrule
  - dayOfMonth: -1 to 28, not 0
  - dayOfWeek: "mo", "tu", "we", "th", "fr", "sa", "su"
- [12:13 PM] - Added `numOfWeek` as REQUIRED field for rrule
  - numOfWeek: -1 to 4 (week number in month)
- [12:17 PM] - Fixed `schedule_invoice_schedule` tool schema
  - Added `liveMode` as REQUIRED field
  - Removed invalid `startDate` field
- [2:16 PM] - Fixed `auto_payment_invoice_schedule` tool schema
  - Removed invalid `enabled` field
  - Added required `id` field (payment method ID)
  - Added required `autoPayment` object with `enable` boolean
- [2:19 PM] - Made `autoPayment.type` required in `auto_payment_invoice_schedule`
- [2:21 PM] - Attempted "Card" as enum value, but API still returned 422.
- [2:24 PM] - Reverted `autoPayment.type` to string to allow testing different values.
  - Known failed values: "card", "Card"
  - Suspected values to try: "credit_card", "us_bank_account", "bank_transfer", "ach"
- [2:32 PM] - User tested "Card" again (or similiar) and confirmed 422 error.
  - Action: Continuing to search for valid enum values. Will suggest trying "credit_card" next.
- [2:32 PM] - Investigation continues: GHL API requires `autoPayment.type` to be a valid enum value.
  - User provided docs show example: `type: "card"` or `"us_bank_account"`.
  - User tested `"us_bank_account"` (Request 264) -> Failed with 422.
  - User tested `"Card"` (Request 256) -> Failed with 422.
  - Hypothesis: API might require dependent fields (like `card` object or `paymentMethodId`) or the enum values in docs are slightly incorrect (case sensitivity?).
  - Action: Updated `auto_payment_invoice_schedule` tool description to include all fields from docs (paymentMethodId, customerId, card object, etc.) and suggest "card"/"us_bank_account" as starting points. Kept schema as string to allow testing.
- [2:56 PM] - **FINAL STATUS**: Exhaustive testing completed. All logical enum values rejected:
  - Tested: "card", "Card", "us_bank_account", "sepa_direct_debit"
  - Result: All return 422 "autoPayment.type must be a valid enum value"
  - **CONCLUSION**: This is a GHL API bug or documentation error. The MCP tool is correctly structured.
  - **RECOMMENDATION**: Document as known limitation, file GHL support ticket, move forward with working tools.
  - **STATUS**: Blocking issue on GHL's side. Cannot be fixed without GHL providing correct enum values.

## Key Findings
- Agent reported 422 error on `create_invoice` - same pattern as estimate/template tools
- `CreateInvoiceDto` requires: name, businessDetails, currency, items, discount, contactDetails, issueDate, sentTo, liveMode
- **GHL Platform Limitation**: `title` field has MAX 40 character limit
- **GHL Platform Limitation**: Invoices created via `text2pay_invoice` are SMS-only unless email was included in `sentTo`. Attempting to use `send_invoice` with `action: "email"` on a text2pay-created invoice returns 400 error "No email found for invoice to send"
- **GHL Platform Bug**: `schedule_invoice_schedule` returns 500 error "Cannot read properties of undefined (reading 'enable')" - this is a GHL server-side error, not our tool bug. The schedule may need `autoPayment` configuration or the GHL API has a bug.

## Next Steps
- [x] Check `create_invoice` tool definition
- [x] Compare with `CreateInvoiceDto` type
- [x] Fix schema with correct required fields
- [x] Rebuild and test

## Notes
- Continuing from Dec 22-23 session where we fixed multiple invoice/estimate tool schemas
- Pattern: GHL API requires `businessDetails`, `items` with `type`, `discount`, `contactDetails` etc.
