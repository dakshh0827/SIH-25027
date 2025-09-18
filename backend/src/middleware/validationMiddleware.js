// middleware/validationMiddleware.js (DEBUG VERSION)
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  // Use safeParse to prevent crashing the server
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // If validation fails, send back a detailed error AND the body we received
    return res.status(400).json({
      message: "Zod validation failed.",
      zod_errors: result.error.errors,
      body_received: req.body, // This will show us what the server got
    });
  }

  // If validation is successful, continue to the controller
  next();
};
