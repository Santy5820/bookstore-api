import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { BooksController } from "./books.controller";

const router = Router();
const booksController = new BooksController();

router.post("/", asyncHandler(booksController.create));
router.get("/", asyncHandler(booksController.findAll));
router.get("/:id", asyncHandler(booksController.findById));
router.put("/:id", asyncHandler(booksController.update));
router.delete("/:id", asyncHandler(booksController.delete));

export default router;
