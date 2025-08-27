/*
id string pk username string email string
fullName string
avatar string
coverImage string
watchHistory ObjectId [] videos
password string
refreshToken string
createdAt Date
updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary URl
      required: true,
    },
    coverImage: {
      type: String, //cloudinary URl
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true } // automatically creates createdAt and updatedAt Date fields
);

//encrypting password using bcrypt - middleware
//just before saving the pw - encrypts it

userSchema.pre("save", async function (next) {
  //only run if password is modified
  if (!this.isModified("password")) return next();
  //encrypting
  this.password = bcrypt.hash(this.password, 10);

  next();
});
// match to see if correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // true or false
};

//generating access token
userSchema.methods.generateAccessToken = function () {
  //short lived access token
  return jwt.sign(
    {
      _id: this._id, //payload
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET, //key
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } //expiry
  );
};

//generate refresh token - not short lived
userSchema.methods.generateRefreshToken = function () {
  //refresh token only has id to update the fields
  return jwt.sign(
    {
      _id: this._id, //payload
    },
    process.env.REFRESH_TOKEN_SECRET, //key
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } //expiry
  );
};

export const User = mongoose.model("User", userSchema);
