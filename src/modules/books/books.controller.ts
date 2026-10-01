import { Request, Response } from "express";
import { BooksService } from "./books.service";

export class BooksController {
    private readonly booksService = new BooksService();

    create = async (req: Request, res: Response): Promise<void> => {
        const book = await this.booksService.create(req.body);
        res.status(201).json(book);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.booksService.findAll());
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.booksService.findById(req.params.id));
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.booksService.update(req.params.id, req.body));
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.booksService.delete(req.params.id);
        res.status(204).send();
    };
}
