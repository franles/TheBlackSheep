import { Router } from "express";
import passport from "passport";
import {
  failure,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { isAuthenticate } from "../middlewares/isAuthtenticate";

const router = Router();

router.get(
  "/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: `/api/auth/failure`,
    failureMessage: true,
    session: false,
  }),
  login
);
router.post("/refresh", refreshToken);
router.post("/logout", isAuthenticate, logout);
router.get("/failure", failure);

export default router;
