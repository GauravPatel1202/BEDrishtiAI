import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          // Check if googleId already exists (manual unique constraint check)
          const existingUserWithGoogleId = await prisma.user.findFirst({ 
            where: { googleId: profile.id } 
          });

          if (existingUserWithGoogleId) {
            return done(new Error('Google account already linked to another user'), null);
          }

          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

          if (!user && email) {
            // Check if an email account already exists
            user = await prisma.user.findUnique({ where: { email } });

            if (user) {
              // Link Google ID to existing email account
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id, provider: 'google' },
              });
            } else {
              // Create a new user with Google
              user = await prisma.user.create({
                data: {
                  googleId: profile.id,
                  email,
                  name: profile.displayName,
                  provider: 'google',
                  password: null, // no password for OAuth
                },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth not configured: missing GOOGLE_CLIENT_ID/SECRET.');
}

// Generate JWT token for OAuth users
export const generateOAuthToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, provider: user.provider },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

export default passport;
