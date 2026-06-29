Product Requirements Document (PRD)

Project Name: B2B Portal & RFQ Engine

Target Release: Fase 1 (Core RFQ & Catalog)

1. Executive Summary & Vision

Membangun portal B2B digital (Katalog & Sistem Manajemen RFQ) yang merampingkan proses penawaran harga (quoting) untuk pembeli furnitur internasional high-volume. Sistem ini menggantikan proses negosiasi tidak terstruktur melalui platform messaging eksternal menjadi sebuah platform state-driven yang tersentralisasi, dapat diaudit secara hukum, dan dikontrol penuh mutasi datanya.

2. Target Audience & Roles

Guest (Unverified User): Pengunjung publik. Hanya dapat melihat spesifikasi teknis, dimensi, dan material produk tanpa akses ke visibilitas harga.

Verified Buyer: Klien B2B (Manajer Purchasing) yang telah melalui tahap approval. Dapat melihat harga (jika ada), membuat form Inquiry/RFQ, melakukan negosiasi di dalam portal, dan mengunduh dokumen pengiriman.

Sales/Admin: Tim operasional internal. Bertugas menyetujui akun klien, menghitung ongkos kirim kargo laut/udara, menerbitkan Proforma Invoice, dan mengubah state logistik dari pesanan.

3. Core Features & Business Logic

3.1 Gated Catalog & Product Management

Katalog Digital: Menampilkan SKU beserta dimensi, material, finishing, rasio CBM (Cubic Meter), dan MOQ.

Image Optimization: Seluruh unggahan foto produk wajib di-intercept oleh backend untuk dikompresi dan dikonversi ke format WebP sebelum didistribusikan melalui Cloudflare R2.

3.2 Inquiry Cart & RFQ Generation

Sistem Keranjang Non-Transaksional: Buyer menambahkan barang dan memasukkan target kuantitas pembelian. Sistem melakukan validasi aturan MOQ di level API.

Submit to Quote: Keranjang tidak berujung pada Payment Gateway, melainkan dikonversi menjadi entitas Draft Order untuk di- review oleh Admin.

3.3 B2B Communication Layer

Contextual Negotiation Chat: Sistem pesan internal (asynchronous) yang secara relasional terikat dengan Unique ID dari RFQ. Obrolan sangat spesifik untuk membahas pesanan tersebut, menjamin audit trail komunikasi bisnis.

Event-Driven Notification: Menggunakan penyedia layanan email transaksional untuk mengirim push notification ke Buyer dan Admin pada setiap perubahan state krusial atau pesan masuk baru.

3.4 Document Hub

Auto-Generated PDF: Sistem menghasilkan Proforma Invoice secara dinamis dari data RFQ yang dimasukkan Admin.

Secure Document Storage: Admin mengunggah dokumen Commercial Invoice, Packing List, dan Bill of Lading ke bucket R2 yang dilindungi. Dokumen ini hanya bisa diunduh oleh Buyer yang terautentikasi dan memiliki relasi dengan ID pesanan terkait.

4. State Machine UX Flow (Integrasi Backend & UI)

Pendekatan State-First Development menuntut antarmuka (UI) untuk tunduk secara absolut pada state dari pesanan. UI tidak boleh menyediakan aksi (tombol/form) yang tidak diizinkan oleh state machine.

Berikut adalah panduan transisi UX di pihak Buyer:

Current StateUX State & Visibilitas UI (Buyer Side)Allowed Actions (Mutasi)DRAFT_INQUIRYKeranjang aktif. Menampilkan daftar item, input kuantitas, dan field "Special Request Notes".Edit Qty, Remove Item, Submit RFQ.SUBMITTEDState terkunci (Read-only). Pesanan pindah ke tab "Active Quotes". Terdapat progress bar visual (Status: Waiting for Admin to Review).Cancel Inquiry (Batal).QUOTEDNotifikasi Email masuk. Buka detail RFQ $\rightarrow$ UI menampilkan tombol besar "Accept Quotation" atau "Request Revision". Link download Proforma Invoice PDF muncul. Fitur Contextual Chat terbuka.Accept, Reject, Chat dengan Admin.ACCEPTEDStatus pesanan terkunci sebagai Binding Contract. UI memunculkan instruksi pembayaran manual (Nomor Rekening T/T atau instruksi L/C) secara prominent di atas invoice.(Menunggu Admin verifikasi pembayaran).PAYMENT_VERIFIEDUI progress bar bergerak maju. Menampilkan estimasi tanggal mulai produksi (Estimated Production Start).Lihat Status.IN_PRODUCTIONUI menampilkan persentase atau status produksi mingguan (opsional jika Admin rajin update, jika tidak, cukup statis "On Going").Lihat Status, Chat dengan Admin.READY_TO_SHIPUI menampilkan peringatan bahwa barang sedang antre di pelabuhan/gudang logistik.Lihat Status.SHIPPEDStatus berubah. Krusial: Section Dokumen Terkunci sekarang terbuka. Buyer bisa mengunduh Bill of Lading (B/L) dan Packing List dari R2.Download Legal Documents.COMPLETEDPesanan masuk ke tab "History". Keseluruhan UI menjadi read-only archive.Re-order (menduplikasi item ke DRAFT_INQUIRY baru).

5. Engineering Constraints & Architecture

Sistem enterprise ini harus dirancang dengan ketahanan struktural tingkat tinggi:

Arsitektur Codebase: Wajib mengadopsi pola Feature-Based Packaging. Hindari arsitektur layer-driven tradisional (pemisahan controllers, models, views secara global). Direktori dipilah berdasarkan domain bisnis (misal: /src/features/catalog, /src/features/rfq, /src/features/documents).

Infrastruktur & Penyimpanan: Implementasi mandiri menggunakan VPS (Ubuntu/Arch Linux) yang diorkestrasi melalui container Docker. Penyimpanan aset statis dan dokumen legal ditaruh di Cloudflare R2 untuk efisiensi transfer data keluar (egress).

Presisi Komputasi Finansial: Seluruh entitas nilai uang (subtotal, shipping cost) di tingkat skema database menggunakan tipe Decimal (bukan Float) untuk mencegah inakurasi komputasi fraksional.