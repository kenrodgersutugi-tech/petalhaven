export const SHOP_INFO = {
  name: 'Petals Haven Gift Shop',
  town: 'Meru, Kenya',
  building: 'Mwitu Centre Building',
  locationDetails: 'Shop just below Sayen Hyperstore, Mwitu Centre Building, Meru',
  fullAddress: 'Mwitu Centre Building, below Sayen Hyperstore, Meru, Kenya',
  instagramHandle: '@petalhaven_meru',
  instagramUrl: 'https://instagram.com/petalhaven_meru',
  supportPerson: 'Winnie',
  supportPhone: '+254729228364',
  supportPhoneDisplay: '+254 729 228 364',
  whatsappUrl: 'https://wa.me/254729228364?text=Hello%20Winnie,%20I%20am%20inquiring%20about%20Petals%20Haven%20gifts',
  currency: 'KSh',
  currencyCode: 'KES',
};

/**
 * Format a number as Kenyan Shillings (KSh)
 * Example: 4500 -> "KSh 4,500"
 */
export function formatPrice(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'KSh 0';
  }
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function formatKES(amount: number | undefined | null): string {
  return formatPrice(amount);
}
