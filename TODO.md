# Production Refactoring TODO

## Security Hardening
- [ ] Restrict CORS to specific origins
- [ ] Remove fallback secrets from server.js, authController.js, middleware/auth.js
- [ ] Use shared Prisma client across all files
- [ ] Add input validation middleware
- [ ] Add rate limiting to routes
- [ ] Add security headers (helmet)

## Performance Optimization
- [ ] Add compression middleware
- [ ] Configure Prisma connection pooling
- [ ] Add caching for frequently accessed data

## Error Handling & Logging
- [ ] Implement structured logging (winston)
- [ ] Improve error responses (no sensitive info leakage)
- [ ] Add proper error boundaries

## Configuration Management
- [ ] Add environment variable validation
- [ ] Add production-specific configurations
- [ ] Update package.json scripts for production

## Code Quality
- [ ] Consistent Prisma client usage
- [ ] Add graceful shutdown
- [ ] Code cleanup and optimization

## Testing & Deployment
- [ ] Test all endpoints after changes
- [ ] Update documentation
- [ ] Add health check endpoints
