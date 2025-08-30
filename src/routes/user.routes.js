import { Router } from "express";
import { registerUser, logoutUser } from "../controllers/usercontroller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

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

//secured routes
//req first goes through verifyJWT then goes to logoutUser controller
router.route("/logout").post(verifyJWT, logoutUser);

// Temporary test endpoint to verify multer is working
router.post("/multer-test", upload.single("avatar"), (req, res) => {
  return res.status(200).json({
    message: "Multer is working",
    body: req.body,
    file: req.file,
  });
});

export default router;
