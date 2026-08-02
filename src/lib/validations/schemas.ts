import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: emailSchema,
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the Terms of Service." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Home"),
  fullName: z.string().trim().min(2, "Enter a full name."),
  line1: z.string().trim().min(3, "Enter a street address."),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "Enter a city."),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(2, "Enter a postal code."),
  country: z.string().trim().min(2, "Select a country."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  email: emailSchema,
  shippingAddress: addressSchema,
  billingAddressSameAsShipping: z.boolean(),
  billingAddress: addressSchema.optional(),
  couponCode: z.string().trim().toUpperCase().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: emailSchema,
  subject: z.string().trim().min(3, "Enter a subject."),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(2000),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Reviews must be at least 10 characters.").max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

// --- Admin schemas ----------------------------------------------------------

export const productAdminSchema = z.object({
  sku: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  careInstructions: z.string().trim().optional(),
  material: z.string().trim().optional(),
  priceCents: z.number().int().min(0),
  compareAtPriceCents: z.number().int().min(0).optional().nullable(),
  collectionId: z.string().uuid().optional().nullable(),
  category: z.string().trim().min(1),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
export type ProductAdminInput = z.infer<typeof productAdminSchema>;

export const couponAdminSchema = z.object({
  code: z.string().trim().toUpperCase().min(3),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  percentage: z.number().int().min(1).max(100).optional().nullable(),
  valueCents: z.number().int().min(0).optional().nullable(),
  minSubtotalCents: z.number().int().min(0).default(0),
  maxRedemptions: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CouponAdminInput = z.infer<typeof couponAdminSchema>;
