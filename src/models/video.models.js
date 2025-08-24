/*
owner ObjectId users
videoFile string
thumbnail string 
title string 
description string 
duration number
views number
isPublished boolean
createdAt Date
updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0, // default 0 views on videos
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//mongoose aggregation pipeline injecting
videoSchema.plugin(mongooseAggregatePaginate);

export default Video = mongoose.model("Video", videoSchema);
