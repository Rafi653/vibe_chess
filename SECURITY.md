# Security Policy

## Security Measures Implemented

### Authentication & Authorization
- ✅ JWT-based authentication with secure token generation
- ✅ Password hashing using bcrypt (salt rounds: 10)
- ✅ Protected routes with authentication middleware
- ✅ User session management via JWT tokens
- ✅ Token expiration (7 days by default)

### Data Protection
- ✅ MongoDB ObjectId validation
- ✅ Input validation on registration/login
- ✅ Password complexity requirements (minimum 6 characters)
- ✅ Unique constraints on usernames and emails
- ✅ Sensitive data (passwords) excluded from API responses

### Database Security
- ✅ Mongoose schema validation
- ✅ Parameterized queries via Mongoose ODM
- ✅ Database indexes for efficient queries

## Production Security Recommendations

### 🔴 Critical (Must Implement Before Production)

1. **Rate Limiting**
   - Install: `npm install express-rate-limit`
   - Apply to all routes, especially:
     - `/api/auth/login` (5 requests per 15 minutes)
     - `/api/auth/register` (3 requests per hour)
     - `/api/friends/search` (30 requests per minute)
   
   Example:
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,
     message: 'Too many login attempts, please try again later'
   });
   
   app.use('/api/auth/login', authLimiter);
   ```

2. **Input Sanitization**
   - Install: `npm install express-mongo-sanitize express-validator`
   - Sanitize all user inputs to prevent NoSQL injection
   
   Example:
   ```javascript
   import mongoSanitize from 'express-mongo-sanitize';
   import { body, validationResult } from 'express-validator';
   
   app.use(mongoSanitize());
   
   // Add validation middleware
   const validateLogin = [
     body('email').isEmail().normalizeEmail(),
     body('password').isLength({ min: 6 })
   ];
   ```

3. **Environment Variables**
   - Change JWT_SECRET to a strong random string (min 32 characters)
   - Use proper production MongoDB URI with authentication
   - Never commit .env file to version control
   
   Generate secure secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **HTTPS/TLS**
   - Use HTTPS in production (Let's Encrypt for free certificates)
   - Set secure cookie flags
   - Implement HSTS headers

### 🟡 High Priority (Recommended)

5. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
     optionsSuccessStatus: 200
   }));
   ```

6. **Security Headers**
   - Install: `npm install helmet`
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

7. **Account Security**
   - Implement account lockout after 5 failed login attempts
   - Add email verification for new accounts
   - Implement password reset via email
   - Add 2FA support (optional but recommended)

8. **Session Management**
   - Implement token refresh mechanism
   - Add logout blacklist for invalidated tokens
   - Monitor active sessions per user

### 🟢 Medium Priority (Nice to Have)

9. **Logging & Monitoring**
   - Install: `npm install winston morgan`
   - Log all authentication attempts
   - Monitor suspicious activities
   - Set up alerts for unusual patterns

10. **Database Backups**
    - Implement automated MongoDB backups
    - Test backup restoration regularly
    - Store backups securely

11. **API Documentation Security**
    - Don't expose internal API structure publicly
    - Use API versioning
    - Implement API key system for external access

12. **Content Security**
    - Implement Content Security Policy (CSP)
    - Validate and sanitize user-uploaded content (avatars)
    - Limit file upload sizes
    - Scan uploaded files for malware

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers at [security email]. Do not open public issues for security vulnerabilities.

## Security Updates

- Keep all dependencies updated regularly
- Run `npm audit` before each deployment
- Subscribe to security advisories for used packages
- Review and apply security patches promptly

## Current Security Scan Results

Last CodeQL scan: [Date]
- Rate limiting warnings: 31 (all routes need rate limiting)
- Input validation warnings: 4 (search queries need sanitization)
- Critical vulnerabilities: 0
- High severity issues: 0

## Development vs Production

**Development Environment:**
- Relaxed rate limits for testing
- Detailed error messages
- No HTTPS requirement
- Sample JWT secret acceptable

**Production Environment:**
- Strict rate limits
- Generic error messages
- HTTPS required
- Strong JWT secret mandatory
- All security recommendations implemented

## Security Checklist

Before deploying to production, ensure:

- [ ] Rate limiting implemented on all routes
- [ ] Input sanitization middleware active
- [ ] Strong JWT_SECRET configured
- [ ] HTTPS enabled with valid certificate
- [ ] CORS properly configured
- [ ] Helmet security headers active
- [ ] MongoDB authentication enabled
- [ ] Database backups configured
- [ ] Logging and monitoring active
- [ ] Error messages sanitized (no stack traces)
- [ ] Dependencies audited and updated
- [ ] Security headers tested
- [ ] Rate limits tested and tuned
- [ ] Account lockout mechanism active
- [ ] Email verification enabled

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
