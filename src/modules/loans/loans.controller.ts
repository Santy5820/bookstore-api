import { Request, Response } from "express";
import { LoansService } from "./loans.service";

export class LoansController {
    private readonly loansService = new LoansService();

    create = async (req: Request, res: Response): Promise<void> => {
        res.status(201).json(await this.loansService.create(req.body));
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.loansService.findAll());
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.loansService.findById(req.params.id));
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.loansService.update(req.params.id, req.body));
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.loansService.delete(req.params.id);
        res.status(204).send();
    };
}
