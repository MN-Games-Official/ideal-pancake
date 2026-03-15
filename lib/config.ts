export const config = {
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_BASE || '/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Roblox
  robloxApi: {
    cloudBase: 'https://apis.roblox.com',
    groupsBase: 'https://groups.roblox.com'
  },
  
  // AI
  abacusAi: {
    baseUrl: process.env.ABACUS_AI_BASE_URL || 'https://routellm.abacus.ai/v1',
    model: process.env.ABACUS_AI_MODEL || 'gemini-3-flash-preview'
  },
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM_EMAIL || 'noreply@polarisone.com'
  }
};
