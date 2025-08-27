import { Router } from "express";

import { healthcheck } from "../controllers/healthcheck.controllers.js";

const router = Router();

router.route("/").get(healthcheck);

///api/v1/healthcheck/test
// router.route("/test").get(healthcheck);

export default router;
 