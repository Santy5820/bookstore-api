import { Router } from "express";
import demoRoutes from "../../modules/demo/demo.routes";

const router = Router();

router.use("/demo", demoRoutes);

export default router;
