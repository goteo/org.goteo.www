import { ZodIssueCode, type ZodErrorMap } from "zod";
import { t } from "svelte-i18n";
import { get } from "svelte/store";

// Enhanced i18nGet with strong parameter typing and proper value handling
const i18nGet = (key: string, values?: Record<string, unknown>): string => {
  try {
    // Make sure we have proper values for interpolation
    const safeValues = values ? { ...values } : undefined;
    
    // If we have a min/max parameter, ensure it's a number and convert to string for display
    if (safeValues && 'min' in safeValues) {
      safeValues.min = String(safeValues.min);
    }
    if (safeValues && 'max' in safeValues) {
      safeValues.max = String(safeValues.max);
    }
    
    // Get translation with values
    const translation = get(t)(key, safeValues);
    
    // Debug information for development
    if (import.meta.env.DEV && translation === key) {
      console.warn(`Missing translation for key: ${key}`, safeValues);
    }
    
    // Return translation or key as fallback
    return translation !== key ? translation : key;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return key; // Return the key as fallback
  }
};

export const localeErrorMap: ZodErrorMap = (issue, ctx) => {
  let message: string;
  
  // Handle issue based on code
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        message = i18nGet("zod.required");
      } else {
        message = i18nGet("zod.invalid_type", {
          expected: issue.expected,
          received: issue.received,
        });
      }
      break;
    
    case ZodIssueCode.too_small:
      // Ensure we're properly handling the minimum value
      if (issue.type === "string") {
        message = i18nGet("zod.string.too_small", { 
          min: issue.minimum !== undefined ? issue.minimum : 1
        });
      } else if (issue.type === "number") {
        message = i18nGet("zod.number.too_small", { 
          min: issue.minimum !== undefined ? issue.minimum : 0
        });
      } else {
        message = i18nGet("zod.too_small", { 
          min: issue.minimum !== undefined ? issue.minimum : 0
        });
      }
      break;
      
    case ZodIssueCode.too_big:
      if (issue.type === "string") {
        message = i18nGet("zod.string.too_big", { max: issue.maximum });
      } else if (issue.type === "number") {
        message = i18nGet("zod.number.too_big", { max: issue.maximum });
      } else {
        message = i18nGet("zod.too_big", { max: issue.maximum });
      }
      break;
      
    case ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        message = i18nGet("zod.email.invalid");
      } else if (issue.validation === "url") {
        message = i18nGet("zod.url.invalid");
      } else {
        message = i18nGet("zod.string.invalid");
      }
      break;
      
    case ZodIssueCode.invalid_enum_value:
      message = i18nGet("zod.enum.invalid", {
        options: issue.options ? issue.options.join(", ") : "",
      });
      break;
      
    // Custom error handling for refinements
    default:
      // Use the message as a translation key if it exists
      message = issue.message ? i18nGet(issue.message) : i18nGet("zod.invalid");
  }

  return { message };
};
