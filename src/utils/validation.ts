import { sanitizeText, validateInput } from './sanitize';

export interface ValidationError {
  field: string;
  message: string;
}

export interface CheckoutFormData {
  email: string;
  name: string;
  phone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  sameAsShipping: boolean;
}

export const validateCheckoutForm = (formData: CheckoutFormData, language: 'en' | 'es'): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Email validation
  if (!formData.email || !validateInput.email(formData.email)) {
    errors.push({
      field: 'email',
      message: language === 'es' ? 'Email inválido' : 'Invalid email address'
    });
  }

  // Name validation
  if (!formData.name || !validateInput.name(formData.name)) {
    errors.push({
      field: 'name',
      message: language === 'es' ? 'Nombre debe tener entre 2 y 100 caracteres' : 'Name must be between 2 and 100 characters'
    });
  }

  // Phone validation (basic)
  if (formData.phone && formData.phone.length > 0) {
    const phoneRegex = /^[\+]?[\s\.\-\(\)]*([0-9][\s\.\-\(\)]*){10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.push({
        field: 'phone',
        message: language === 'es' ? 'Número de teléfono inválido' : 'Invalid phone number'
      });
    }
  }

  // Shipping address validation
  if (!formData.shippingAddress.line1 || formData.shippingAddress.line1.length < 5) {
    errors.push({
      field: 'shippingAddress.line1',
      message: language === 'es' ? 'Dirección requerida (mínimo 5 caracteres)' : 'Address required (minimum 5 characters)'
    });
  }

  if (!formData.shippingAddress.city || formData.shippingAddress.city.length < 2) {
    errors.push({
      field: 'shippingAddress.city',
      message: language === 'es' ? 'Ciudad requerida' : 'City required'
    });
  }

  if (!formData.shippingAddress.state || formData.shippingAddress.state.length < 2) {
    errors.push({
      field: 'shippingAddress.state',
      message: language === 'es' ? 'Estado/Provincia requerido' : 'State/Province required'
    });
  }

  if (!formData.shippingAddress.postal_code || formData.shippingAddress.postal_code.length < 3) {
    errors.push({
      field: 'shippingAddress.postal_code',
      message: language === 'es' ? 'Código postal requerido' : 'Postal code required'
    });
  }

  // Billing address validation (if different from shipping)
  if (!formData.sameAsShipping) {
    if (!formData.billingAddress.line1 || formData.billingAddress.line1.length < 5) {
      errors.push({
        field: 'billingAddress.line1',
        message: language === 'es' ? 'Dirección de facturación requerida' : 'Billing address required'
      });
    }

    if (!formData.billingAddress.city || formData.billingAddress.city.length < 2) {
      errors.push({
        field: 'billingAddress.city',
        message: language === 'es' ? 'Ciudad de facturación requerida' : 'Billing city required'
      });
    }

    if (!formData.billingAddress.state || formData.billingAddress.state.length < 2) {
      errors.push({
        field: 'billingAddress.state',
        message: language === 'es' ? 'Estado/Provincia de facturación requerido' : 'Billing state/province required'
      });
    }

    if (!formData.billingAddress.postal_code || formData.billingAddress.postal_code.length < 3) {
      errors.push({
        field: 'billingAddress.postal_code',
        message: language === 'es' ? 'Código postal de facturación requerido' : 'Billing postal code required'
      });
    }
  }

  return errors;
};

export const sanitizeFormData = (formData: CheckoutFormData): CheckoutFormData => {
  return {
    email: sanitizeText(formData.email.toLowerCase()),
    name: sanitizeText(formData.name),
    phone: sanitizeText(formData.phone),
    shippingAddress: {
      line1: sanitizeText(formData.shippingAddress.line1),
      line2: formData.shippingAddress.line2 ? sanitizeText(formData.shippingAddress.line2) : '',
      city: sanitizeText(formData.shippingAddress.city),
      state: sanitizeText(formData.shippingAddress.state),
      postal_code: sanitizeText(formData.shippingAddress.postal_code),
      country: sanitizeText(formData.shippingAddress.country),
    },
    billingAddress: {
      line1: sanitizeText(formData.billingAddress.line1),
      line2: formData.billingAddress.line2 ? sanitizeText(formData.billingAddress.line2) : '',
      city: sanitizeText(formData.billingAddress.city),
      state: sanitizeText(formData.billingAddress.state),
      postal_code: sanitizeText(formData.billingAddress.postal_code),
      country: sanitizeText(formData.billingAddress.country),
    },
    sameAsShipping: formData.sameAsShipping,
  };
};