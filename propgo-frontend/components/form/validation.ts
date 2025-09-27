export type Rule = {
  required?: boolean;
  requiredWhen?: Record<string, any[]>; // field -> allowed values that make this required
  min?: number | 'currentYear';
  max?: number | 'currentYear';
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex source
  integer?: boolean;
};

export type Rules = Record<string, Rule>;

export interface ValidationMessages {
  required: string;
  pattern: string;
  min: string;
  max: string;
  minLength: string;
  maxLength: string;
  integer: string;
}

export function validateValues(values: Record<string, any>, rules: Rules, messages: ValidationMessages) {
  const errors: Record<string, string> = {};
  const year = new Date().getFullYear();

  const isEmpty = (v: any) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

  for (const field of Object.keys(rules)) {
    const rule = rules[field];
    const value = values[field];

    // requiredWhen
    let isRequired = !!rule.required;
    if (rule.requiredWhen) {
      for (const depField of Object.keys(rule.requiredWhen)) {
        const allowed = rule.requiredWhen[depField];
        if (allowed.includes(values[depField])) {
          isRequired = true;
        }
      }
    }
    if (isRequired && isEmpty(value)) {
      errors[field] = messages.required;
      continue;
    }

    if (isEmpty(value)) continue; // skip rest if empty and not required

    if (rule.integer && typeof value === 'number' && !Number.isInteger(value)) {
      errors[field] = messages.integer;
      continue;
    }

    if (rule.min !== undefined) {
      const minVal = rule.min === 'currentYear' ? year : rule.min;
      if (typeof value === 'number' && value < (minVal as number)) {
        errors[field] = messages.min;
        continue;
      }
    }

    if (rule.max !== undefined) {
      const maxVal = rule.max === 'currentYear' ? year : rule.max;
      if (typeof value === 'number' && value > (maxVal as number)) {
        errors[field] = messages.max;
        continue;
      }
      if (Array.isArray(value) && typeof rule.max === 'number' && value.length > rule.max) {
        errors[field] = messages.max;
        continue;
      }
    }

    if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = messages.minLength;
      continue;
    }

    if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = messages.maxLength;
      continue;
    }

    if (rule.pattern) {
      const re = new RegExp(rule.pattern);
      if (typeof value === 'string' && !re.test(value)) {
        errors[field] = messages.pattern;
        continue;
      }
    }
  }

  return errors;
}
