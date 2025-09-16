// middleware/validationMiddleware.js
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (e) {
    // --- DEBUGGING LINE ---
    // This will print the exact error object to your terminal
    console.log("--- VALIDATION MIDDLEWARE ERROR ---", e);
    // ----------------------

    // Check if the error is a Zod validation error
    if (e instanceof ZodError) {
      const errors = e.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      // If it is, send a 400 Bad Request with the detailed errors
      return res.status(400).json({ errors });
    }

    // If it's a different kind of error, send a generic 500 error
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during validation." });
  }
};
