export interface Product {
  id: string;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  price_cents: number;
  compare_at_price_cents?: number;
  images: string[];
  category_id: string;
  tags: string[];
  variants?: ProductVariant[];
  is_active: boolean;
  printify_product_id?: string;
  printify_data?: any;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
  available: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: {
    es: string;
    en: string;
  };
  description?: {
    es: string;
    en: string;
  };
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant_id?: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id?: string;
  total_amount_cents: number;
  shipping_amount_cents: number;
  tax_amount_cents: number;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  stripe_payment_intent_id?: string;
  printify_order_id?: string;
  tracking_number?: string;
  tracking_url?: string;
  created_at: string;
  updated_at: string;
}