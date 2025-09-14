interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Puerto Rico ZIP codes range
const PR_ZIP_CODES = {
  min: 601,
  max: 988
};

// US states and territories
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'PR', 'VI', 'GU', 'AS', 'MP'
];

// Puerto Rico municipalities (principales)
const PR_MUNICIPALITIES = [
  'SAN JUAN', 'BAYAMÓN', 'CAROLINA', 'PONCE', 'CAGUAS', 'GUAYNABO',
  'ARECIBO', 'TOA BAJA', 'MAYAGÜEZ', 'TRUJILLO ALTO', 'CAYEY',
  'VEGA ALTA', 'HUMACAO', 'MANATÍ', 'AGUADILLA', 'TARJA', 'DORADO',
  'CANÓVANAS', 'YAUCO', 'FAJARDO', 'CIDRA', 'COAMO', 'GURABO',
  'JUANA DÍAZ', 'TOA ALTA', 'ISABELA', 'CAMUY', 'HATILLO',
  'AIBONITO', 'VEGA BAJA', 'CATAÑO', 'YABUCOA', 'SALINAS'
];

export const validateAddress = (address: Address, language: 'en' | 'es' = 'en'): AddressValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!address.line1?.trim()) {
    errors.push(language === 'es' ? 'La dirección es requerida' : 'Address line 1 is required');
  }

  if (!address.city?.trim()) {
    errors.push(language === 'es' ? 'La ciudad es requerida' : 'City is required');
  }

  if (!address.state?.trim()) {
    errors.push(language === 'es' ? 'El estado es requerido' : 'State is required');
  }

  if (!address.postal_code?.trim()) {
    errors.push(language === 'es' ? 'El código postal es requerido' : 'Postal code is required');
  }

  if (!address.country?.trim()) {
    errors.push(language === 'es' ? 'El país es requerido' : 'Country is required');
  }

  // Country specific validation
  if (address.country?.toUpperCase() === 'US' || address.country?.toUpperCase() === 'USA') {
    // Validate US state
    if (address.state && !US_STATES.includes(address.state.toUpperCase())) {
      errors.push(
        language === 'es' 
          ? 'Estado inválido para Estados Unidos'
          : 'Invalid state for United States'
      );
    }

    // Validate ZIP code format for US
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (address.postal_code && !zipRegex.test(address.postal_code)) {
      errors.push(
        language === 'es'
          ? 'Formato de código postal inválido (debe ser 12345 o 12345-6789)'
          : 'Invalid ZIP code format (should be 12345 or 12345-6789)'
      );
    }

    // Puerto Rico specific validation
    if (address.state?.toUpperCase() === 'PR') {
      const zipNum = parseInt(address.postal_code?.substring(0, 5) || '0');
      
      // Check if ZIP is in PR range
      if (zipNum < PR_ZIP_CODES.min || zipNum > PR_ZIP_CODES.max) {
        errors.push(
          language === 'es'
            ? `Código postal debe estar entre 00601-00988 para Puerto Rico`
            : `ZIP code must be between 00601-00988 for Puerto Rico`
        );
      }

      // Check if city matches common PR municipalities
      const cityUpper = address.city?.toUpperCase();
      if (cityUpper && !PR_MUNICIPALITIES.some(muni => 
        cityUpper.includes(muni) || muni.includes(cityUpper)
      )) {
        warnings.push(
          language === 'es'
            ? 'Verifica que el municipio sea correcto para Puerto Rico'
            : 'Please verify the municipality is correct for Puerto Rico'
        );
      }
    }
  }

  // Email format validation for other countries
  if (address.country?.toUpperCase() !== 'US' && address.country?.toUpperCase() !== 'USA') {
    if (address.postal_code && address.postal_code.length < 3) {
      warnings.push(
        language === 'es'
          ? 'El código postal parece muy corto'
          : 'Postal code seems too short'
      );
    }
  }

  // General format validations
  if (address.line1 && address.line1.length < 5) {
    warnings.push(
      language === 'es'
        ? 'La dirección parece muy corta'
        : 'Address seems too short'
    );
  }

  if (address.city && address.city.length < 2) {
    errors.push(
      language === 'es'
        ? 'El nombre de la ciudad es muy corto'
        : 'City name is too short'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const formatZipCode = (zip: string, country: string): string => {
  if (country?.toUpperCase() === 'US' || country?.toUpperCase() === 'USA') {
    // Remove any non-digits
    const digits = zip.replace(/\D/g, '');
    
    // Format as ZIP+4 if applicable
    if (digits.length === 9) {
      return `${digits.substring(0, 5)}-${digits.substring(5)}`;
    }
    
    // Return first 5 digits
    return digits.substring(0, 5);
  }
  
  return zip;
};

export const suggestCorrections = (address: Address, language: 'en' | 'es' = 'en'): string[] => {
  const suggestions: string[] = [];

  // Puerto Rico specific suggestions
  if (address.state?.toUpperCase() === 'PR' && address.country?.toUpperCase() === 'US') {
    const zipNum = parseInt(address.postal_code?.substring(0, 5) || '0');
    
    if (zipNum >= 601 && zipNum <= 988) {
      // Add leading zeros if needed
      const formattedZip = zipNum.toString().padStart(5, '0');
      if (formattedZip !== address.postal_code?.substring(0, 5)) {
        suggestions.push(
          language === 'es'
            ? `¿Quisiste decir ${formattedZip}?`
            : `Did you mean ${formattedZip}?`
        );
      }
    }
  }

  return suggestions;
};