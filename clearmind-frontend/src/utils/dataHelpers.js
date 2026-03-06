/**
 * dataHelpers.js
 * 
 * Utility functions for working with normalized database relationships
 * Instead of parsing JSON strings, these functions work with relationship objects
 */

// ───────────────────────────────────────────────────────────────────────────
// SPECIALIZATIONS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get all specialization names from profile
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of specialization names
 */
export const getSpecializationNames = (profile) => {
  return profile?.specializations?.map(s => s.name) || [];
};

/**
 * Get main specialization from profile
 * @param {Object} profile - Doctor profile object
 * @returns {Object|null} Main specialization object or null
 */
export const getMainSpecialization = (profile) => {
  return profile?.specializations?.find(s => s.pivot?.is_main) || null;
};

/**
 * Get main specialization name
 * @param {Object} profile - Doctor profile object
 * @returns {String} Main specialization name or empty string
 */
export const getMainSpecializationName = (profile) => {
  return getMainSpecialization(profile)?.name || "";
};

/**
 * Check if doctor has specific specialization
 * @param {Object} profile - Doctor profile object
 * @param {String} specName - Specialization name to check
 * @returns {Boolean} True if doctor has this specialization
 */
export const hasSpecialization = (profile, specName) => {
  return profile?.specializations?.some(s => s.name === specName) || false;
};

/**
 * Get all specializations except main
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of secondary specialization names
 */
export const getSecondarySpecializations = (profile) => {
  return profile?.specializations
    ?.filter(s => !s.pivot?.is_main)
    .map(s => s.name) || [];
};

// ───────────────────────────────────────────────────────────────────────────
// SERVICES
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get all service names from profile
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of service names
 */
export const getServiceNames = (profile) => {
  return profile?.services?.map(s => s.name) || [];
};

/**
 * Check if doctor offers specific service
 * @param {Object} profile - Doctor profile object
 * @param {String} serviceName - Service name to check
 * @returns {Boolean} True if doctor offers this service
 */
export const hasService = (profile, serviceName) => {
  return profile?.services?.some(s => s.name === serviceName) || false;
};

// ───────────────────────────────────────────────────────────────────────────
// SUB-SPECIALIZATIONS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get all sub-specialization names
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of sub-specialization names
 */
export const getSubSpecializationNames = (profile) => {
  return profile?.sub_specializations?.map(s => s.name) || [];
};

/**
 * Get sub-specializations for a specific specialization
 * @param {Object} profile - Doctor profile object
 * @param {Number} specId - Specialization ID
 * @returns {Array} Array of sub-specs for this specialization
 */
export const getSubSpecsBySpecialization = (profile, specId) => {
  return profile?.sub_specializations?.filter(s => s.specialization_id === specId) || [];
};

// ───────────────────────────────────────────────────────────────────────────
// BOARD CERTIFICATES
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get certificate names
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of certificate names
 */
export const getCertificateNames = (profile) => {
  return profile?.board_certificates?.map(c => c.name) || [];
};

/**
 * Get all valid (non-expired) certificates
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of valid certificate objects
 */
export const getValidCertificates = (profile) => {
  return profile?.board_certificates?.filter(c => {
    if (!c.pivot?.expiry_date) return true; // No expiry = always valid
    return new Date(c.pivot.expiry_date) > new Date();
  }) || [];
};

/**
 * Get expired certificates
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of expired certificate objects
 */
export const getExpiredCertificates = (profile) => {
  return profile?.board_certificates?.filter(c => {
    if (!c.pivot?.expiry_date) return false;
    return new Date(c.pivot.expiry_date) <= new Date();
  }) || [];
};

/**
 * Get certificates expiring soon (within 30 days)
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of expiring certificate objects
 */
export const getExpiringCertificates = (profile) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return profile?.board_certificates?.filter(c => {
    if (!c.pivot?.expiry_date) return false;
    const expiry = new Date(c.pivot.expiry_date);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
  }) || [];
};

/**
 * Get certificate status
 * @param {Object} certificate - Certificate object with pivot data
 * @returns {String} Status: "No Expiry", "Valid", "Expiring Soon", "Expired"
 */
export const getCertificateStatus = (certificate) => {
  if (!certificate.pivot?.expiry_date) return "No Expiry";
  
  const expiryDate = new Date(certificate.pivot.expiry_date);
  const today = new Date();
  
  if (expiryDate < today) return "Expired";
  
  const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  
  return "Valid";
};

/**
 * Get days until certificate expiry
 * @param {Object} certificate - Certificate object with pivot data
 * @returns {Number|null} Days until expiry, or null if no expiry date
 */
export const getDaysUntilExpiry = (certificate) => {
  if (!certificate.pivot?.expiry_date) return null;
  
  const expiryDate = new Date(certificate.pivot.expiry_date);
  const today = new Date();
  return Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
};

/**
 * Format certificate info for display
 * @param {Object} certificate - Certificate object
 * @returns {Object} Formatted certificate data
 */
export const formatCertificateInfo = (certificate) => {
  const daysUntilExpiry = getDaysUntilExpiry(certificate);
  
  return {
    id: certificate.id,
    name: certificate.name,
    number: certificate.pivot?.certificate_number || "N/A",
    issuedDate: certificate.pivot?.issued_date,
    expiryDate: certificate.pivot?.expiry_date,
    image: certificate.pivot?.certificate_image,
    status: getCertificateStatus(certificate),
    daysUntilExpiry,
    isExpired: getCertificateStatus(certificate) === "Expired",
    isExpiringSoon: getCertificateStatus(certificate) === "Expiring Soon",
  };
};

// ───────────────────────────────────────────────────────────────────────────
// FORMATTING & DISPLAY
// ───────────────────────────────────────────────────────────────────────────

/**
 * Format specializations list for display
 * @param {Object} profile - Doctor profile object
 * @param {String} separator - String to join with (default: ", ")
 * @returns {String} Formatted specialization string
 */
export const formatSpecializations = (profile, separator = ", ") => {
  return getSpecializationNames(profile).join(separator);
};

/**
 * Format services list for display
 * @param {Object} profile - Doctor profile object
 * @param {String} separator - String to join with (default: ", ")
 * @returns {String} Formatted services string
 */
export const formatServices = (profile, separator = ", ") => {
  return getServiceNames(profile).join(separator);
};

/**
 * Format sub-specializations list for display
 * @param {Object} profile - Doctor profile object
 * @param {String} separator - String to join with (default: ", ")
 * @returns {String} Formatted sub-specs string
 */
export const formatSubSpecializations = (profile, separator = ", ") => {
  return getSubSpecializationNames(profile).join(separator);
};

/**
 * Format full doctor bio/credential string
 * @param {Object} profile - Doctor profile object
 * @param {Object} user - User object
 * @returns {String} Full formatted credential line
 */
export const formatDoctorCredentials = (user, profile) => {
  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Doctor";
  const title = profile?.professional_title || "Professional";
  const prc = profile?.prc_number || "PRF License N/A";
  
  return `${name}, ${title} (${prc})`;
};

// ───────────────────────────────────────────────────────────────────────────
// VALIDATION & CHECKS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Check if profile is complete
 * @param {Object} profile - Doctor profile object
 * @returns {Boolean} True if profile has all required fields
 */
export const isProfileComplete = (profile) => {
  return (
    profile?.professional_title &&
    profile?.prc_number &&
    profile?.specializations?.length > 0 &&
    profile?.services?.length > 0 &&
    profile?.years_of_experience != null
  );
};

/**
 * Get missing profile fields
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of missing field names
 */
export const getMissingProfileFields = (profile) => {
  const missing = [];
  
  if (!profile?.professional_title) missing.push("Professional Title");
  if (!profile?.prc_number) missing.push("PRC Number");
  if (!profile?.specializations?.length) missing.push("Specializations");
  if (!profile?.services?.length) missing.push("Services");
  if (profile?.years_of_experience == null) missing.push("Years of Experience");
  
  return missing;
};

/**
 * Get profile completion percentage
 * @param {Object} profile - Doctor profile object
 * @returns {Number} Completion percentage (0-100)
 */
export const getProfileCompletionPercentage = (profile) => {
  const requiredFields = [
    'professional_title',
    'prc_number',
    'specializations',
    'services',
    'years_of_experience',
    'board_certificates',
    'sub_specializations',
    'profile_picture',
    'description',
  ];
  
  let completed = 0;
  requiredFields.forEach(field => {
    if (profile?.[field]) {
      if (Array.isArray(profile[field]) && profile[field].length > 0) {
        completed++;
      } else if (!Array.isArray(profile[field])) {
        completed++;
      }
    }
  });
  
  return Math.round((completed / requiredFields.length) * 100);
};

/**
 * Check if doctor has valid credentials to see patients
 * @param {Object} profile - Doctor profile object
 * @returns {Boolean} True if doctor can see patients
 */
export const canSeePatients = (profile) => {
  return (
    profile?.professional_title &&
    profile?.prc_number &&
    profile?.specializations?.length > 0 &&
    getValidCertificates(profile).length > 0
  );
};

// ───────────────────────────────────────────────────────────────────────────
// CONVERSION & TRANSFORMATION
// ───────────────────────────────────────────────────────────────────────────

/**
 * Convert profile to legacy JSON format (for backward compatibility)
 * @param {Object} profile - Doctor profile object
 * @returns {Object} Profile with JSON string fields
 */
export const profileToLegacyFormat = (profile) => {
  return {
    ...profile,
    specializations: JSON.stringify(getSpecializationNames(profile)),
    services: JSON.stringify(getServiceNames(profile)),
    sub_specializations: JSON.stringify(getSubSpecializationNames(profile)),
    board_certificates: JSON.stringify(getCertificateNames(profile)),
  };
};

/**
 * Extract certificate image URLs from certificates
 * @param {Object} profile - Doctor profile object
 * @returns {Array} Array of image URLs
 */
export const getCertificateImages = (profile) => {
  return profile?.board_certificates
    ?.filter(c => c.pivot?.certificate_image)
    .map(c => c.pivot.certificate_image) || [];
};

// ───────────────────────────────────────────────────────────────────────────
// SORTING & FILTERING
// ───────────────────────────────────────────────────────────────────────────

/**
 * Sort certificates by expiry date
 * @param {Object} profile - Doctor profile object
 * @param {String} order - "asc" or "desc" (default: "asc")
 * @returns {Array} Sorted certificates
 */
export const sortCertificatesByExpiry = (profile, order = "asc") => {
  const certs = [...(profile?.board_certificates || [])];
  
  return certs.sort((a, b) => {
    if (!a.pivot?.expiry_date) return order === "asc" ? 1 : -1;
    if (!b.pivot?.expiry_date) return order === "asc" ? -1 : 1;
    
    const dateA = new Date(a.pivot.expiry_date);
    const dateB = new Date(b.pivot.expiry_date);
    
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

export default {
  // Specializations
  getSpecializationNames,
  getMainSpecialization,
  getMainSpecializationName,
  hasSpecialization,
  getSecondarySpecializations,
  
  // Services
  getServiceNames,
  hasService,
  
  // Sub-specializations
  getSubSpecializationNames,
  getSubSpecsBySpecialization,
  
  // Board Certificates
  getCertificateNames,
  getValidCertificates,
  getExpiredCertificates,
  getExpiringCertificates,
  getCertificateStatus,
  getDaysUntilExpiry,
  formatCertificateInfo,
  
  // Formatting
  formatSpecializations,
  formatServices,
  formatSubSpecializations, 
  formatDoctorCredentials,
  
  // Validation
  isProfileComplete,
  getMissingProfileFields,
  getProfileCompletionPercentage,
  canSeePatients,
  
  // Conversion
  profileToLegacyFormat,
  getCertificateImages,
  
  // Sorting
  sortCertificatesByExpiry,
};