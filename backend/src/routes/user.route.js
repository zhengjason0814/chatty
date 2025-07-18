import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRecommendedUsers, getMyFriends } from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", protectRoute, getRecommendedUsers);

router.get("/friends", protectRoute, getMyFriends);

export default router;
