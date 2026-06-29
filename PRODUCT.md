# B2B Portal & RFQ Engine

## Product Overview
Centralized state-driven quoting platform for international furniture trade. Connects verified buyers with furniture manufacturers/exporters through a structured RFQ lifecycle, gated catalog, and document management system.

## Target Users
- **Guest**: Public catalog browsing only, no pricing or documents
- **Verified Buyer**: Full catalog access, RFQ submission, negotiation chat, document download (PI, B/L, Packing List)
- **Sales/Admin**: RFQ approval workflows, quote issuance, invoice generation, logistics state management, buyer verification

## Domain
B2B furniture manufacturing, international export trade. Handles multi-currency pricing, Incoterms, shipping logistics documentation, and trade compliance documents.

## Core Features

### 1. Gated Catalog
- Product listings with WebP-optimized images
- Public view: categories, product names, general specs only
- Verified buyer view: pricing tiers, MOQ, lead times, full spec sheets
- Category and attribute filtering

### 2. Inquiry Cart → RFQ State Machine
9-state lifecycle:
1. DRAFT_INQUIRY — buyer adds items to inquiry cart
2. SUBMITTED — buyer submits inquiry for review
3. QUOTED — sales team issues formal quote
4. ACCEPTED — buyer accepts quote terms
5. PAYMENT_VERIFIED — finance confirms payment receipt
6. IN_PRODUCTION — order enters manufacturing
7. READY_TO_SHIP — goods ready, documents prepared
8. SHIPPED — logistics confirmed, tracking issued
9. COMPLETED — delivery confirmed, order closed

State transitions are role-gated: buyers advance to ACCEPTED, sales/admin handle all other transitions.

### 3. Contextual Negotiation Chat
- Per-RFQ threaded chat between buyer and sales
- Message history preserved per RFQ ID
- Supports text and file attachment references
- Visible only to parties involved in the RFQ

### 4. Document Hub
- Proforma Invoice (PDF) generation
- Bill of Lading upload
- Packing List upload
- All documents stored via Cloudflare R2
- Access gated by RFQ ownership and state

### 5. Event-Driven Email Notifications
- State transition emails to buyer and assigned sales rep
- Quote issuance notification
- Payment verification confirmation
- Shipment notification with tracking details

## Architecture Principles
- Feature-based module packaging
- MongoDB + Mongoose/Typegoose for all data models
- Remix + Express with RBAC middleware
- Decimal.js for all financial values (no floating point)
- Flat Remix routes, modular Express API

## Brand & Tone
- Enterprise-grade, internationally oriented
- Professional, trust-building, precise
- No consumer-facing fluff — this is a trade platform
- Language: English (primary), designed for international buyers

## Roles & Permissions (RBAC)
- `guest`: catalog read only
- `verified_buyer`: catalog, inquiry cart, RFQ CRUD (own), chat (own RFQs), document download (own RFQs)
- `sales`: all buyer permissions + quote issuance, state transitions (QUOTED → PAYMENT_VERIFIED → IN_PRODUCTION → READY_TO_SHIP → SHIPPED → COMPLETED), buyer verification
- `admin`: all sales permissions + user management, system config, full audit access
