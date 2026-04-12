import { Router } from "express";
import { searchAll } from "../controller/search.controller.js";
import { verifyJWT } from "../middlewire/auth.middlewire.js";

const router= Router();

router.route("/").get(verifyJWT,searchAll);

export default router;