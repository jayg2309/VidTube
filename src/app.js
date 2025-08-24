import express from "express";
import cors from "cors"; //--> who can talk to DB
import cookieParser from "cookie-parser";

const app = express();

//middlewares - in between configurations, for securing applications
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//common middleware
app.use(express.json({ limit: "16kb" })); // all the data which comes in
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // serve images, css directly
app.use(cookieParser());
//import routes
import healthcheckRouter from "./routes/healthchecks.routes.js";

//create route
app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
