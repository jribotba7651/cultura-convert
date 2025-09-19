// src/utils/addressValidation.ts - Complete fixed version

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAddress(address: Address, language: string = 'en'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!address.line1?.trim()) {
    errors.push(
      language === 'es' 
        ? 'La dirección es requerida'
        : 'Address line 1 is required'
    );
  }

  if (!address.city?.trim()) {
    errors.push(
      language === 'es' 
        ? 'La ciudad es requerida'
        : 'City is required'
    );
  }

  if (!address.state?.trim()) {
    errors.push(
      language === 'es' 
        ? 'El estado es requerido'
        : 'State is required'
    );
  }

  if (!address.country?.trim()) {
    errors.push(
      language === 'es' 
        ? 'El país es requerido'
        : 'Country is required'
    );
  }

  // Validate postal code
  if (!address.postal_code?.trim()) {
    errors.push(
      language === 'es' 
        ? 'El código postal es requerido'
        : 'Postal code is required'
    );
  } else {
    const isValid = validateZipCode(address.postal_code, address.country);
    if (!isValid) {
      errors.push(
        language === 'es' 
          ? 'Formato de código postal inválido (debe ser 12345 o 12345-6789)'
          : 'Invalid postal code format (must be 12345 or 12345-6789)'
      );
    }
  }

  // Validate state format for US
  if (address.country === 'US' && address.state) {
    const state = address.state.trim().toUpperCase();
    if (state.length === 2) {
      // Valid US state codes
      const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC'
      ];
      
      if (!validStates.includes(state)) {
        warnings.push(
          language === 'es'
            ? 'Código de estado no reconocido'
            : 'State code not recognized'
        );
      }
    } else if (state.length > 2) {
      warnings.push(
        language === 'es'
          ? 'Use el código de estado de 2 letras (ej: CA)'
          : 'Use 2-letter state code (e.g., CA)'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateZipCode(zipCode: string, country: string = 'US'): boolean {
  if (!zipCode) return false;
  
  const trimmed = zipCode.trim();
  
  if (country === 'US') {
    // US ZIP codes: exactly 5 digits or 5+4 format (12345 or 12345-1234)
    const usZipRegex = /^(\d{5})(-\d{4})?$/;
    return usZipRegex.test(trimmed);
  }
  
  if (country === 'CA') {
    // Canadian postal codes: A1A 1A1 or A1A1A1
    const canadaRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadaRegex.test(trimmed);
  }
  
  // Basic fallback for other countries
  return trimmed.length >= 3 && trimmed.length <= 10;
}

export function formatZipCode(zipCode: string, country: string = 'US'): string {
  if (!zipCode) return '';
  
  if (country === 'US') {
    // Remove all non-digits and hyphens
    const cleaned = zipCode.replace(/[^\d-]/g, '');
    
    // Remove existing hyphens
    const digitsOnly = cleaned.replace(/-/g, '');
    
    // Format based on length
    if (digitsOnly.length <= 5) {
      return digitsOnly;
    } else if (digitsOnly.length <= 9) {
      return digitsOnly.slice(0, 5) + '-' + digitsOnly.slice(5, 9);
    } else {
      // Truncate to 9 digits max
      return digitsOnly.slice(0, 5) + '-' + digitsOnly.slice(5, 9);
    }
  }
  
  if (country === 'CA') {
    // Canadian postal code formatting
    const cleaned = zipCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length >= 6) {
      return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
    }
    return cleaned;
  }
  
  // For other countries, just remove special characters except hyphens and spaces
  return zipCode.replace(/[^A-Za-z0-9\s-]/g, '').trim();
}

// Helper function to normalize state input
export function normalizeState(state: string, country: string = 'US'): string {
  if (!state) return '';
  
  if (country === 'US') {
    const trimmed = state.trim().toUpperCase();
    
    // Common state name to abbreviation mapping
    const stateMap: { [key: string]: string } = {
      'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
      'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
      'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
      'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
      'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
      'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
      'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
      'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
      'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
      'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
      'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
      'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
      'WISCONSIN': 'WI', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC'
    };
    
    return stateMap[trimmed] || trimmed;
  }
  
  return state.trim();
}