import { z } from "zod";

export const schemaHelper = {
  input: (
    fieldKey: string,
    opts?: {
      required?: boolean;
      min?: number;
      max?: number;
    }
  ) => {
    const { required = true, min = 1, max = 100 } = opts || {};

    let schema = z.string({
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a string`,
    });

    if (required) {
      schema = schema.min(min, {
        message: `${fieldKey} is required`,
      });
    }

    schema = schema.max(max, {
      message: `${fieldKey} must not exceed ${max} characters`,
    });

    return schema;
  },

  textarea: (
    fieldKey: string,
    opts?: {
      required?: boolean;
      min?: number;
      max?: number;
    }
  ) => {
    const { required = true, min = 1, max = 1000 } = opts || {};

    let schema = z.string({
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a string`,
    });

    if (required) {
      schema = schema.min(min, {
        message: `${fieldKey} is required`,
      });
    }

    schema = schema.max(max, {
      message: `${fieldKey} must not exceed ${max} characters`,
    });

    return schema;
  },

  email: (fieldKey: string, opts?: { required?: boolean }) => {
    const { required = true } = opts || {};

    let schema = z.string({
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a valid email`,
    });

    if (required) {
      schema = schema.min(1, {
        message: `${fieldKey} is required`,
      });
    }

    return schema.email({
      message: `${fieldKey} must be a valid email`,
    });
  },

  number: (
    fieldKey: string,
    opts?: {
      required?: boolean;
    }
  ) => {
    const { required = true } = opts || {};

    const baseSchema = z.number({
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a number`,
    });

    return required ? baseSchema : baseSchema.nullable().optional();
  },

  select: (fieldKey: string, opts?: { required?: boolean }) => {
    const { required = true } = opts || {};

    let schema = z.string({
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a valid option`,
    });

    if (required) {
      schema = schema.min(1, {
        message: `${fieldKey} is required`,
      });
    }

    return schema;
  },

  enum: (
    fieldKey: string,
    values: [string, ...string[]],
    opts?: { required?: boolean }
  ) => {
    const { required = true } = opts || {};

    const schema = z.enum(values, {
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be a valid option`,
    });

    return required ? schema : z.union([schema, z.undefined()]);
  },

  file: (
    fieldKey: string,
    opts?: { required?: boolean; maxSizeMB?: number; allowedTypes?: string[] }
  ) => {
    const { required = true, maxSizeMB, allowedTypes } = opts || {};

    let schema = z.custom<File>((val) => val instanceof File, {
      message: `${fieldKey} must be a valid file`,
    });

    if (required) {
      schema = schema.refine((file) => !!file, {
        message: `${fieldKey} is required`,
      });
    }

    if (maxSizeMB) {
      schema = schema.refine(
        (file) => !file || file.size <= maxSizeMB * 1024 * 1024,
        {
          message: `${fieldKey} must not exceed ${maxSizeMB}MB`,
        }
      );
    }

    if (allowedTypes?.length) {
      schema = schema.refine(
        (file) => !file || allowedTypes.includes(file.type),
        {
          message: `${fieldKey} must be one of: ${allowedTypes.join(", ")}`,
        }
      );
    }

    return schema;
  },

  array: (
    fieldKey: string,
    itemSchema: z.ZodSchema,
    opts?: { required?: boolean }
  ) => {
    const { required = true } = opts || {};

    const baseSchema = z.array(itemSchema, {
      required_error: `${fieldKey} is required`,
      invalid_type_error: `${fieldKey} must be an array`,
    });

    return required
      ? baseSchema.min(1, {
          message: `${fieldKey} must contain at least one item`,
        })
      : baseSchema.optional();
  },

  url: (fieldKey: string, opts?: { required?: boolean }) => {
    const { required = false } = opts || {};

    const urlSchema = z.string().url({
      message: `${fieldKey} must be a valid URL`,
    });

    if (required) {
      return urlSchema.min(1, {
        message: `${fieldKey} is required`,
      });
    }

    return z.union([z.literal(""), urlSchema]);
  },

  boolean: (
    fieldKey: string,
    opts?: {
      required?: boolean;
      defaultValue?: boolean;
    }
  ) => {
    const { required = true, defaultValue = true } = opts || {};

    const schema = z
      .boolean({
        required_error: `${fieldKey} is required`,
        invalid_type_error: `${fieldKey} must be a boolean`,
      })
      .default(defaultValue);

    return required ? schema : schema.optional();
  },
};
