import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: "/api/auth/failure",
  })
);
// router.get("/callback");
// router.get("/failure");
// router.get("/status");

export default router;
