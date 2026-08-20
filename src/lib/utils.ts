import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes an Egyptian (or international) phone number for WhatsApp wa.me links.
 * Correctly handles +20..., 0020..., 20..., 010..., 10... without duplicating the country code '2'.
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("002")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("20") && digits.length >= 12) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `20${digits.slice(1)}`;
  }

  if (digits.startsWith("1")) {
    return `20${digits}`;
  }

  return digits.startsWith("2") ? digits : `20${digits}`;
}
