import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} from "../controllers/usercontroller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecure routes - no need to verifyJWT
//serve on /register
router.route("/register").post(
  //getting multiple fields - cover image,avatar
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes
//req first goes through verifyJWT(middleware) then goes to logoutUser controller
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("c/:username").get(verifyJWT, getUserChannelProfile);
router.route("update-account").patch(verifyJWT, updateAccountDetails);
router.route("/history").get(verifyJWT, getWatchHistory);
//images wadu
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Temporary test endpoint to verify multer is working
router.post("/multer-test", upload.single("avatar"), (req, res) => {
  return res.status(200).json({
    message: "Multer is working",
    body: req.body,
    file: req.file,
  });
});

export default router;
