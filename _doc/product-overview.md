# Product Overview: B2B Portal & RFQ Engine

## Identity
**Name:** B2B Portal & RFQ Engine
**Tagline:** Centralized state-driven quoting platform for international furniture trade
**Release:** Fase 1 — Core RFQ & Catalog
**Domain:** B2B furniture manufacturing, international export trade

## Vision
Replace unstructured messaging-based negotiations (WhatsApp, email) with a legally auditable, centralized digital portal purpose-built for high-volume international furniture buyers. Every quote, every negotiation, every document lives in one state-controlled, fully traceable system.

## Users & Roles

### Guest (Unverified Visitor)
- Public access only
- Can view: product specifications, dimensions, materials, CBM ratio, MOQ
- Cannot view: pricing, inventory, or any transactional data
- Path to access: apply for Verified Buyer status

### Verified Buyer (B2B Purchasing Manager)
- Approved B2B client accounts
- Can view: full catalog with pricing, Proforma Invoices
- Can do: create Inquiry/RFQ forms, negotiate within portal, download shipping/legal documents
- Receives: email notifications on state changes and new Admin messages

### Sales/Admin (Internal Operations Team)
- Internal staff accounts
- Can do: approve/reject buyer accounts, calculate sea/air freight costs, issue Proforma Invoices, update order logistics state throughout fulfillment
- Full access to all order data and document management

## Core Features

### 1. Gated Catalog & Product Management
- Digital catalog displaying SKUs with: dimensions, material, finishing, CBM ratio (Cubic Meter), MOQ
- Price visibility gated — Guests see specs only; pricing visible to Verified Buyers
- Image optimization pipeline: backend intercepts all uploads, compresses and converts to WebP format before distribution via Cloudflare R2

### 2. Inquiry Cart & RFQ Generation
- Non-transactional cart system: Buyers add items and input target purchase quantities
- MOQ validation enforced at API level (not just frontend)
- "Submit to Quote" action: cart converts to Draft Order entity for Admin review
- No payment gateway integration — pure B2B quoting and contract workflow
- Special Request Notes field for buyer context per inquiry

### 3. B2B Communication Layer
- Contextual negotiation chat: asynchronous messaging tied to specific RFQ Unique ID
- Each chat thread is strictly scoped to one order — full business communication audit trail
- Event-driven email notifications to both Buyer and Admin on: state changes, new messages, document availability

### 4. Document Hub
- Auto-generated Proforma Invoice PDF from Admin-entered RFQ data
- Admin uploads: Commercial Invoice, Packing List, Bill of Lading to protected Cloudflare R2 bucket
- Document access enforced: only authenticated buyers with matching order ID may download
- Documents unlocked by order state — B/L and Packing List accessible only after SHIPPED state

## Order State Machine

The entire system is state-first. UI actions (buttons, forms) are only rendered when permitted by the current state.

| State | Buyer UX | Allowed Actions |
|-------|----------|-----------------|
| DRAFT_INQUIRY | Active cart: item list, qty inputs, Special Request Notes field | Edit Qty, Remove Item, Submit RFQ |
| SUBMITTED | Read-only. Progress bar: "Waiting for Admin to Review" | Cancel Inquiry |
| QUOTED | Email notification received. Accept Quotation / Request Revision buttons. Proforma Invoice PDF download link. Contextual Chat opened. | Accept, Reject, Chat with Admin |
| ACCEPTED | Locked as Binding Contract. Payment instructions (T/T bank account or L/C terms) displayed prominently above invoice. | Await Admin payment verification |
| PAYMENT_VERIFIED | Progress bar advances. Estimated Production Start date displayed. | View Status |
| IN_PRODUCTION | Weekly production status or percentage shown (or static "On Going" if not updated). | View Status, Chat with Admin |
| READY_TO_SHIP | Alert: goods queued at port / logistics warehouse. | View Status |
| SHIPPED | Document section unlocked. Buyer downloads Bill of Lading and Packing List from R2. | Download Legal Documents |
| COMPLETED | Order archived in "History" tab. Full read-only archive view. | Re-order (duplicates items to new DRAFT_INQUIRY) |

## Architecture & Engineering Constraints

- **Codebase pattern:** Feature-Based Packaging — directories by business domain (`/src/features/catalog`, `/src/features/rfq`, `/src/features/documents`). No global layer-driven architecture.
- **Infrastructure:** Self-hosted VPS (Ubuntu/Arch Linux), Docker container orchestration, Cloudflare R2 for all asset and legal document storage (egress-efficient)
- **Financial precision:** All monetary values (subtotal, shipping cost) stored as Decimal type — not Float — in database schema to prevent fractional computation errors
- **Authentication:** Role-based access control (Guest / Verified Buyer / Sales/Admin). Admin verifies and approves buyer accounts manually.
- **Notifications:** Transactional email provider for all event-driven notifications (state changes, new messages)

## Brand & Tone
- Enterprise-grade, professional, internationally oriented
- Primary operating language: Bahasa Indonesia (internal ops), with English document outputs (Proforma Invoice, B/L, Packing List)
- Trust signals: audit trail visibility, state-locked UI, legal document chain
- Anti-pattern: no payment gateway, no consumer-facing UX patterns, no gamification
