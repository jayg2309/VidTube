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

// Temporary test endpoint to verify multer is working
router.post("/multer-test", upload.single("avatar"), (req, res) => {
  return res.status(200).json({
    message: "Multer is working",
    body: req.body,
    file: req.file,
  });
});

export default router;
