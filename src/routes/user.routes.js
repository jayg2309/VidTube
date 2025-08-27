import { Router } from "express";
import { registerUser } from "../controllers/usercontroller.js";
import { upload } from "../middlewares/multer.middlewares.js";

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

export default router;
