# Security Policy 🔒

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
- Security vulnerabilities should be reported privately
- Public issues can expose users to attacks

### 2. **DO** report via email
- Send details to: security@project-co-pilot.com
- Include "SECURITY VULNERABILITY" in the subject line

### 3. **Include the following information:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 4. **What happens next:**
- We'll acknowledge receipt within 48 hours
- We'll investigate and provide updates
- We'll work on a fix and coordinate disclosure
- We'll credit you in the security advisory (if desired)

## Security Best Practices

### For Users
- Keep your API keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Regularly update dependencies
- Monitor for security advisories

### For Developers
- Follow secure coding practices
- Validate all user inputs
- Use HTTPS in production
- Implement proper authentication and authorization
- Keep dependencies updated

## Security Features

### Data Protection
- **No Data Storage**: Audio transcripts are processed in-memory only
- **Secure APIs**: Uses official AssemblyAI and Google Cloud APIs
- **JWT Tokens**: Secure authentication with proper token management
- **CORS Protection**: Properly configured cross-origin resource sharing

### Privacy
- **Local Processing**: Audio processing happens on your local machine
- **No Logging**: Sensitive data is not logged or stored
- **User Control**: Extension can be easily disabled or removed
- **Transparent**: Open source code for security review

## Responsible Disclosure

We follow responsible disclosure practices:
1. **Private Reporting**: Vulnerabilities reported privately
2. **Timely Response**: Acknowledge and investigate promptly
3. **Coordinated Fix**: Develop and test fixes thoroughly
4. **Public Disclosure**: Release security advisory with fix
5. **Credit**: Acknowledge reporters (with permission)

## Security Updates

- Security patches are released as soon as possible
- Critical vulnerabilities get immediate attention
- Updates are clearly marked in release notes
- Users are notified of important security changes

## Contact

For security-related questions or reports:
- Email: security@project-co-pilot.com
- PGP Key: [Available upon request]
- Response Time: Within 48 hours

Thank you for helping keep Project Co-Pilot secure! 🛡️ 