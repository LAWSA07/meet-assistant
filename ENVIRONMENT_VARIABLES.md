# Environment Variables Guide 🔧

This document provides a comprehensive guide for all environment variables required by Project Co-Pilot.

## Quick Setup

Copy the example file and fill in your values:
```bash
cp backend/env_example.txt backend/.env
```

## Required Variables

### 🔐 Database Configuration
```env
# MongoDB Connection String
MONGODB_URL=mongodb://localhost:27017/project_co_pilot

# Database Name
MONGODB_DB_NAME=project_co_pilot
```

**Setup Instructions:**
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `project_co_pilot`
3. For Atlas: Use connection string like `mongodb+srv://username:password@cluster.mongodb.net/project_co_pilot`

### 🤖 Google Gemini (LLM)
```env
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

**Setup Instructions:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

**Pricing:** Free tier includes generous usage limits

### 🔑 JWT Secret
```env
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
```

**Setup Instructions:**
1. Generate a secure random string (32+ characters)
2. Use a password generator or:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. **IMPORTANT:** Change this in production!

## Optional Variables

### 🔗 OAuth Configuration

#### GitHub OAuth
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Setup Instructions:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID and Client Secret

#### Google OAuth
```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Setup Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `http://localhost:3000/auth/google/callback`
4. Copy Client ID and Client Secret

### ⚙️ Server Configuration
```env
# Server host and port
HOST=127.0.0.1
PORT=8001

# Debug mode (set to False in production)
DEBUG=True

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging level
LOG_LEVEL=INFO
```

### 🌐 Frontend Configuration
```env
# React App Environment Variables (create .env in src/ directory)
REACT_APP_API_BASE_URL=http://127.0.0.1:8001
REACT_APP_WS_URL=ws://127.0.0.1:8001
```

### 🔌 Extension Configuration
```env
# Extension Environment Variables (set in contentScript.js)
API_URL=http://127.0.0.1:8001
WS_URL=ws://127.0.0.1:8001/ws/audio
```

## Production Configuration

### Security Checklist
- [ ] Change `JWT_SECRET_KEY` to a secure random string
- [ ] Set `DEBUG=False`
- [ ] Use HTTPS URLs for OAuth callbacks
- [ ] Configure proper CORS origins
- [ ] Use environment-specific MongoDB connection
- [ ] Set up proper logging
- [ ] Update frontend URLs to production domain
- [ ] Update extension URLs to production domain

### Environment-Specific Files
```bash
# Development
.env.development

# Production
.env.production

# Testing
.env.test
```

## Validation

### Test Your Configuration
```bash
# Test backend connection
curl http://localhost:8001/

# Test WebSocket
curl http://localhost:8001/ws-test

# Test LLM connection
curl http://localhost:8001/test-llm
```

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string format
   - Ensure database exists

2. **API Key Errors**
   - Verify API keys are correct
   - Check API quotas and limits
   - Ensure APIs are enabled

3. **OAuth Issues**
   - Verify callback URLs match
   - Check client ID/secret
   - Ensure OAuth apps are properly configured

4. **Frontend Connection Issues**
   - Check if backend is running
   - Verify API_BASE_URL is correct
   - Check CORS configuration

5. **Extension Connection Issues**
   - Verify API_URL and WS_URL are correct
   - Check if backend is accessible from extension
   - Ensure proper host permissions in manifest

## Security Notes

### ⚠️ Important Security Practices
- **Never commit `.env` files to version control**
- **Use different API keys for development and production**
- **Rotate API keys regularly**
- **Monitor API usage and costs**
- **Use environment-specific configurations**

### 🔒 Sensitive Data Handling
- API keys are loaded from environment variables
- No sensitive data is logged
- JWT tokens are properly secured
- Database connections use secure protocols

## Troubleshooting

### Environment Variable Not Found
```python
# Check if variable exists
import os
api_key = os.getenv('ASSEMBLYAI_API_KEY')
if not api_key:
    raise ValueError("ASSEMBLYAI_API_KEY not found in environment")
```

### Debug Environment Loading
```python
# Print all environment variables (remove in production)
import os
for key, value in os.environ.items():
    if 'KEY' in key or 'SECRET' in key:
        print(f"{key}: {'*' * len(value)}")
    else:
        print(f"{key}: {value}")
```

## Support

If you encounter issues with environment setup:
1. Check this documentation
2. Verify all required variables are set
3. Test individual components
4. Check API service status
5. Create an issue on GitHub

---

**Remember:** Keep your API keys secure and never share them publicly! 🔐 