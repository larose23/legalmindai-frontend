import Joi from 'joi';

// Document analysis validation
export const validateDocumentAnalysis = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(10).max(50000).required()
      .messages({
        'string.min': 'Document text must be at least 10 characters long',
        'string.max': 'Document text must not exceed 50,000 characters',
        'any.required': 'Document text is required'
      })
  });
  
  return schema.validate(data);
};

// Document summary validation
export const validateDocumentSummary = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(10).max(50000).required()
      .messages({
        'string.min': 'Document text must be at least 10 characters long',
        'string.max': 'Document text must not exceed 50,000 characters',
        'any.required': 'Document text is required'
      }),
    type: Joi.string().valid('concise', 'detailed', 'key_points').default('concise')
      .messages({
        'any.only': 'Summary type must be one of: concise, detailed, key_points'
      })
  });
  
  return schema.validate(data);
};

// Research query validation
export const validateResearchQuery = (data) => {
  const schema = Joi.object({
    query: Joi.string().min(5).max(1000).required()
      .messages({
        'string.min': 'Research query must be at least 5 characters long',
        'string.max': 'Research query must not exceed 1,000 characters',
        'any.required': 'Research query is required'
      })
  });
  
  return schema.validate(data);
};

// Draft parameters validation
export const validateDraftParameters = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid('nda', 'contract', 'employment').required()
      .messages({
        'any.only': 'Draft type must be one of: nda, contract, employment',
        'any.required': 'Draft type is required'
      }),
    parameters: Joi.object().required()
      .messages({
        'any.required': 'Draft parameters are required'
      })
  });
  
  return schema.validate(data);
};

// Knowledge base entry validation
export const validateKnowledgeEntry = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(500).required()
      .messages({
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title must not exceed 500 characters',
        'any.required': 'Title is required'
      }),
    content: Joi.string().min(10).max(100000).required()
      .messages({
        'string.min': 'Content must be at least 10 characters long',
        'string.max': 'Content must not exceed 100,000 characters',
        'any.required': 'Content is required'
      }),
    category: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Category must not exceed 100 characters'
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional()
      .messages({
        'array.max': 'Maximum 20 tags allowed',
        'string.max': 'Each tag must not exceed 50 characters'
      }),
    source: Joi.string().max(500).optional()
      .messages({
        'string.max': 'Source must not exceed 500 characters'
      })
  });
  
  return schema.validate(data);
};

// Pagination validation
export const validatePagination = (data) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(100)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit must not exceed 1000'
      }),
    offset: Joi.number().integer().min(0).default(0)
      .messages({
        'number.min': 'Offset must be at least 0'
      })
  });
  
  return schema.validate(data);
};

// Search query validation
export const validateSearchQuery = (data) => {
  const schema = Joi.object({
    q: Joi.string().min(1).max(500).required()
      .messages({
        'string.min': 'Search query must be at least 1 character long',
        'string.max': 'Search query must not exceed 500 characters',
        'any.required': 'Search query is required'
      }),
    category: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Category must not exceed 100 characters'
      }),
    limit: Joi.number().integer().min(1).max(1000).default(50)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit must not exceed 1000'
      })
  });
  
  return schema.validate(data);
};