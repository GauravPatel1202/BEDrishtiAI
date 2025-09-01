import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import passport from '../config/passport.js';

const router = Router();

// Public routes
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// Google OAuth routes (only available if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/api/auth/google/failure',
      session: false 
    }),
    authCtrl.googleOAuthCallback
  );

  router.get('/google/failure', authCtrl.googleOAuthFailure);
} else {
  // Provide informative error if Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(501).json({
      error: 'Google OAuth is not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });
}

// Protected routes
router.get('/profile', authenticateToken, authCtrl.getProfile);
router.put('/profile', authenticateToken, authCtrl.updateProfile);
router.post('/logout', authenticateToken, authCtrl.logout);

export default router;
