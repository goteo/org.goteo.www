import { ZodIssueCode, type ZodErrorMap } from "zod";
import { t, unwrapFunctionStore } from "svelte-i18n";

// Get direct access to the translation function
const $t = unwrapFunctionStore(t);

// Helper function to get translation with proper value handling
const translate = (key: string, values?: Record<string, unknown>) => {
  const safeValues = values
    ? Object.entries(values).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
    : undefined;

  return $t(key, safeValues ? { values: safeValues } : undefined);
};

export const localeErrorMap: ZodErrorMap = (issue, ctx) => {
  try {
    // Get the appropriate translation key based on issue code and type
    const getTranslationKey = () => {
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          return issue.received === "undefined" || issue.received === "null" ? "zod.required" : "zod.invalid_type";

        case ZodIssueCode.too_small:
        case ZodIssueCode.too_big:
          // Use the type-specific key if available, otherwise use the generic one
          const sizeIssue = issue.code === ZodIssueCode.too_small ? "too_small" : "too_big";
          const sizeParam = issue.code === ZodIssueCode.too_small ? "min" : "max";
          const sizeValue = issue.code === ZodIssueCode.too_small ? issue.minimum : issue.maximum;

          // Single return statement with ternary to determine the right key
          return `zod.${issue.type ? `${issue.type}.` : ""}${sizeIssue}`;

        case ZodIssueCode.invalid_string:
          // Handle different string validation types
          return issue.validation ? `zod.${issue.validation}.invalid` : "zod.string.invalid";

        case ZodIssueCode.invalid_enum_value:
          return "zod.enum.invalid";

        case ZodIssueCode.invalid_arguments:
          return "zod.invalid_arguments";

        case ZodIssueCode.invalid_return_type:
          return "zod.invalid_return_type";

        case ZodIssueCode.invalid_date:
          return "zod.invalid_date";

        default:
          // If message is a string, use it as a key
          return typeof issue.message === "string"
            ? issue.message
            : `${issue.params?.namespace || "zod"}.${issue.path.join(".")}.${issue.code}`;
      }
    };

    // Get the translation values based on the issue
    const getTranslationValues = () => {
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          return { expected: issue.expected, received: issue.received };

        case ZodIssueCode.too_small:
          return { min: issue.minimum };

        case ZodIssueCode.too_big:
          return { max: issue.maximum };

        case ZodIssueCode.invalid_enum_value:
          return { options: Array.isArray(issue.options) ? issue.options.join(", ") : "" };

        default:
          // Handle custom message objects
          if (typeof issue.message === "object" && issue.message && "values" in issue.message) {
            return (issue.message as { values: Record<string, unknown> }).values;
          }
          return undefined;
      }
    };

    // Get the translation key and values
    const key = getTranslationKey();
    const values = getTranslationValues();

    // Get the translated message
    const message = translate(key, values);

    return { message };
  } catch (error) {
    console.error("Translation error:", error, issue);

    // Simple fallback for critical errors
    return {
      message: typeof issue.message === "string" ? issue.message : `Validation error: ${issue.code}`,
    };
  }
};
