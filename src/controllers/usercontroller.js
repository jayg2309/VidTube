import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //store refresh token to user object in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSafe: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //validation for all
  //checks if any field is an empty string ("") after trimming,
  //while also protecting against null/undefined fields--"?"
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //   if(fullname?.trim()===""){
  //     throw new ApiError(400,"fullname is required")
  //   }

  //check if user exists
  //search based on username or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  console.warn(req.files);
  //handle images
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing ");
  }

  //send the images to cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // //optional
  // let coverImage = "";
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  //better way to handle images
  //avatar
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded avatar", avatar);
  } catch (error) {
    console.log("Error uploading error", error);
    throw new ApiError(500, "Failed to upload avatar");
  }
  //cover images
  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Uploaded cover Image", coverImage);
  } catch (error) {
    console.log("Error uploading error", error);
    throw new ApiError(500, "Failed to upload cover image");
  }
  try {
    //construct a new user
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });
    //check directly in DB if user created
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken" // these fields will not be there
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    //if successfully created , send response to frontend
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User created successfully"));
  } catch (error) {
    console.log("User creation failed");
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering a user and images were deleted"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from body
  const { email, username, password } = req.body;
  //validation
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send all these logged in info to user
  const options = {
    httpOnly: true, //makes cookie non modifiable by client side, only you can
    secure: process.env.NODE_ENV === "production",
  };
  //send all data
  return (
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      // .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      )
  );
});

//logout - means remove the refresh token
const logoutUser = asyncHandler(async (req, res) => {
  await User
    .findByIdAndUpdate
    // getting user id after middleware setup
    ();
});

//generating new fresh set of access tokens for user
const refreshAccessToken = asyncHandler(async (req, res) => {
  //collect incoming token
  const incomingRefreshToken =
    req.cookies.refreshAccessToken || req.body.refreshAccessToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Request token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    //validate
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    //generate new token and send it to user
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = // changing name of refreshToken for our reference
      await generateAccessandRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});

export { registerUser, loginUser, refreshAccessToken };
