import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserService from "../services/users.service";
import { generateAccessToken, generateRefreshToken } from "../utils/utils";
import config from "./config";

export function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID!,
        clientSecret: config.GOOGLE_CLIENT_SECRET!,
        callbackURL: config.GOOGLE_CALLBACK,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        const authenticateEmail = profile.emails?.[0].value;
        if (!authenticateEmail) return done(null, false);
        const user = await UserService.getUser(authenticateEmail!);
        if (!user) {
          return done(null, false);
        }
        const { nombre, email } = user;
        const accessToken = generateAccessToken({ email, nombre });
        const refreshToken = generateRefreshToken({ email, nombre });

        return done(null, { user, accessToken, refreshToken });
      }
    )
  );
}
