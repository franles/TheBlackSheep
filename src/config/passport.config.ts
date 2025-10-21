import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import DIContainer from "../core/DIContainer";
import { generateAccessToken, generateRefreshToken } from "../utils/utils";
import config from "./config";
import logger from "./logger.config";
const userService = DIContainer.getUserService();

export function configurePassport(): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID!,
        clientSecret: config.GOOGLE_CLIENT_SECRET!,
        callbackURL: config.GOOGLE_CALLBACK,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const authenticateEmail = profile.emails?.[0].value;
          const avatar = profile.photos?.[0]?.value ?? "";

          if (!authenticateEmail) {
            logger.warn("Google authentication failed - no email provided", {
              profileId: profile.id,
            });
            return done(null, false);
          }

          // Usar servicio para obtener usuario
          const user = await userService.getUserByEmail(authenticateEmail);

          if (!user) {
            logger.warn("User not found in database", {
              email: authenticateEmail,
            });
            return done(null, false);
          }

          const { nombre, email } = user;

          // Generar tokens
          const accessToken = generateAccessToken({
            auth: true,
            email,
            nombre,
            avatar,
          });
          const refreshToken = generateRefreshToken({ email, nombre });

          logger.info("Google authentication successful", {
            email,
          });

          return done(null, { user, accessToken, refreshToken });
        } catch (error) {
          logger.error("Google authentication error", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
          return done(null, false);
        }
      }
    )
  );
}
