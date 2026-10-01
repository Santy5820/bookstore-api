import { Router } from "express";
import demoRoutes from "../../modules/demo/demo.routes";
import authorsRoutes from "../../modules/authors/authors.routes";

const router = Router();

router.use("/demo", demoRoutes);
router.use("/authors", authorsRoutes);

export default router;
