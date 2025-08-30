import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  //grab token
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  //decode
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    //check if user came in
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    //create a new parameter user for req
    req.user = user;

    //transfer flow from mw to controller or to the final route
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
