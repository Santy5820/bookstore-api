import { Router } from "express";
import demoRoutes from "../../modules/demo/demo.routes";
import authorsRoutes from "../../modules/authors/authors.routes";
import booksRoutes from "../../modules/books/books.routes";
import loansRoutes from "../../modules/loans/loans.routes";

const router = Router();

router.use("/demo", demoRoutes);
router.use("/authors", authorsRoutes);
router.use("/books", booksRoutes);
router.use("/loans", loansRoutes);

export default router;
