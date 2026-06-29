/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  appTagline: string;
  appDescription: string;
  contactEmail: string;
  catalogItemsPerPage: number;
  rfqItemsPerPage: number;
  enableBuyerRegistration: boolean;
  enableNegotiationChat: boolean;
  currencyCode: string;
  defaultIncoterm: string;
  footerText: string;
  heroHeading: string;
  heroSubheading: string;
  catalogHeading: string;
  catalogSubheading: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "FurniTrade Portal",
  logoUrl: "",
  brandColor: {
    // Base
    background:        "#0F172A",
    foreground:        "#F1F5F9",
    // Card
    card:              "#1E293B",
    cardForeground:    "#F1F5F9",
    // Popover
    popover:           "#1E293B",
    popoverForeground: "#F1F5F9",
    // Primary
    primary:           "#0F172A",
    primaryForeground: "#F8FAFC",
    // Secondary
    secondary:           "#1E293B",
    secondaryForeground: "#94A3B8",
    // Muted
    muted:           "#1E293B",
    mutedForeground: "#64748B",
    // Accent
    accent:           "#D97706",
    accentForeground: "#FFFFFF",
    // Destructive
    destructive:           "#DC2626",
    destructiveForeground: "#FFFFFF",
    // Border / Input / Ring
    border: "#334155",
    input:  "#334155",
    ring:   "#D97706",
    // Charts
    chart1: "#D97706",
    chart2: "#3B82F6",
    chart3: "#10B981",
    chart4: "#8B5CF6",
    chart5: "#F59E0B",
    // Navbar
    navbarBackground: "#0F172A",
    // Sidebar
    sidebarBackground:        "#0C1525",
    sidebarForeground:        "#94A3B8",
    sidebarPrimary:           "#D97706",
    sidebarPrimaryForeground: "#FFFFFF",
    sidebarAccent:            "#1E293B",
    sidebarAccentForeground:  "#F1F5F9",
    sidebarBorder:            "#1E293B",
    sidebarRing:              "#D97706",
  },
  font: {
    headingFont: "Inter",
    textFont: "Inter",
  },
  appTagline: "Centralized Quoting Platform for International Furniture Trade",
  appDescription: "Connect with verified furniture manufacturers and exporters. Submit RFQs, negotiate pricing, and manage your international procurement in one place.",
  contactEmail: "trade@furnitrade.com",
  catalogItemsPerPage: 24,
  rfqItemsPerPage: 20,
  enableBuyerRegistration: true,
  enableNegotiationChat: true,
  currencyCode: "USD",
  defaultIncoterm: "FOB",
  footerText: "FurniTrade Portal — International Furniture Trade Platform. All rights reserved.",
  heroHeading: "Source Quality Furniture, Globally",
  heroSubheading: "Access verified manufacturers, submit RFQs, and manage your international procurement with confidence.",
  catalogHeading: "Product Catalog",
  catalogSubheading: "Browse our curated selection of furniture from verified manufacturers. Sign in as a verified buyer to view pricing and submit RFQs.",
};
