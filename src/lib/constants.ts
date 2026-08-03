export const SITE_NAME = "VELMONT";
export const SITE_DESCRIPTION =
  "Considered menswear for a quieter kind of luxury. Tailoring, outerwear, and knitwear made to be worn for decades, not seasons.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://velmont.com";

export const FREE_SHIPPING_THRESHOLD_CENTS = 20000;
export const STANDARD_SHIPPING_CENTS = 1500;
export const EXPRESS_SHIPPING_CENTS = 3500;
export const TAX_RATE = 0.0; // Calculated server-side at checkout based on destination.

export const SHIPPING_METHODS = [
  {
    value: "standard",
    label: "Standard Shipping",
    description: "3–5 business days",
  },
  {
    value: "express",
    label: "Express Shipping",
    description: "1–2 business days",
  },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/collections" },
  { label: "Tailoring", href: "/shop?category=Tailoring" },
  { label: "Outerwear", href: "/shop?category=Outerwear" },
  { label: "Accessories", href: "/shop?category=Accessories" },
  { label: "Sale", href: "/shop?filter=sale" },
  { label: "Contact", href: "/contact" },
] as const;

export const MEGA_MENU_SECTIONS = [
  {
    title: "Tailoring",
    href: "/shop?category=Tailoring",
    items: ["Suits", "Blazers", "Trousers", "Waistcoats"],
  },
  {
    title: "Outerwear",
    href: "/shop?category=Outerwear",
    items: ["Overcoats", "Field Jackets", "Rainwear", "Gilets"],
  },
  {
    title: "Knitwear",
    href: "/shop?category=Knitwear",
    items: ["Crewnecks", "Cardigans", "Polos", "Half-Zips"],
  },
  {
    title: "Accessories",
    href: "/shop?category=Accessories",
    items: ["Belts", "Ties", "Scarves", "Leather Goods"],
  },
] as const;

export const FOOTER_LINKS = {
  Company: [
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Care Guide", href: "/care-guide" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "X", href: "https://x.com" },
] as const;

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
] as const;

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
] as const;

export const SIZE_GUIDE = {
  Tailoring: [
    { size: "36", chest: "36\"", waist: "30\"", length: "29.5\"" },
    { size: "38", chest: "38\"", waist: "32\"", length: "30\"" },
    { size: "40", chest: "40\"", waist: "34\"", length: "30.5\"" },
    { size: "42", chest: "42\"", waist: "36\"", length: "31\"" },
    { size: "44", chest: "44\"", waist: "38\"", length: "31.5\"" },
    { size: "46", chest: "46\"", waist: "40\"", length: "32\"" },
  ],
  Standard: [
    { size: "S", chest: "36-38\"", waist: "30-32\"", length: "27\"" },
    { size: "M", chest: "39-41\"", waist: "33-35\"", length: "28\"" },
    { size: "L", chest: "42-44\"", waist: "36-38\"", length: "29\"" },
    { size: "XL", chest: "45-47\"", waist: "39-41\"", length: "30\"" },
    { size: "XXL", chest: "48-50\"", waist: "42-44\"", length: "31\"" },
  ],
} as const;
