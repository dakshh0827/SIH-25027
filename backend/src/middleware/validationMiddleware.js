// middleware/validationMiddleware.js - FIXED VERSION
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  console.log('=== VALIDATION DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Request files:', req.file ? { filename: req.file.filename, originalname: req.file.originalname } : 'No files');
  
  // Use safeParse to prevent crashing the server
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    console.log('Validation failed:', result.error.errors);
    // If validation fails, send back a detailed error
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        received: err.received
      })),
      // Remove this in production for security
      debug_body_received: req.body
    });
  }
  
  console.log('Validation passed successfully');
  console.log('========================');
  
  // If validation is successful, continue to the controller
  next();
};

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      console.log('=== VALIDATION DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Request files:', req.files ? 'Files present' : 'No files');
      
      // Parse and validate the request body
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        console.log('Validation failed:', result.error);
        
        // FIXED: Check if result.error.errors exists before calling map
        const errors = result.error?.errors || [];
        
        const formattedErrors = errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code
        }));
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      
      console.log('Validation passed');
      
      // Replace req.body with the parsed and transformed data
      req.body = result.data;
      next();
      
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        message: 'Internal server error during validation',
        error: error.message
      });
    }
  };
};