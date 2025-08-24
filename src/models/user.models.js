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

export const User = mongoose.model("User", userSchema);
