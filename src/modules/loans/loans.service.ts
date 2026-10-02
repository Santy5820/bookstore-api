import { ObjectId } from "mongodb";
import { BooksRepository } from "../books/books.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { Loan, LoanDTO } from "./loans.model";
import { LoansRepository } from "./loans.repository";

export class LoansService {
    private readonly loansRepository = new LoansRepository();
    private readonly booksRepository = new BooksRepository();

    async create(data: LoanDTO): Promise<Loan> {
        const book = await this.requireAvailableBook(data?.bookId);
        const loanDate = this.validateDate(data?.loanDate, "loanDate");
        const returned = data.returned === undefined ? false : this.validateBoolean(data.returned, "returned");
        const returnDate = data.returnDate === undefined
            ? (returned ? new Date() : undefined)
            : this.validateDate(data.returnDate, "returnDate");

        if (!returned && returnDate) {
            throw new BadRequestError("'returnDate' solo puede enviarse cuando el préstamo está devuelto");
        }
        if (returnDate && returnDate < loanDate) {
            throw new BadRequestError("'returnDate' no puede ser anterior a 'loanDate'");
        }

        const now = new Date();
        const loan = await this.loansRepository.create({
            bookId: book._id as ObjectId,
            userName: this.requireString(data?.userName, "userName"),
            loanDate,
            ...(returnDate && { returnDate }),
            returned,
            createdAt: now,
            updatedAt: now,
        });

        if (!returned) {
            await this.booksRepository.update(book._id as ObjectId, { available: false, updatedAt: now });
        }
        return loan;
    }

    async findAll(): Promise<Loan[]> {
        return this.loansRepository.findAll();
    }

    async findById(id: string): Promise<Loan> {
        const loan = await this.loansRepository.findById(this.toObjectId(id));
        if (!loan) throw new NotFoundError("Préstamo no encontrado");
        return loan;
    }

    async update(id: string, data: LoanDTO): Promise<Loan> {
        const loanId = this.toObjectId(id);
        const current = await this.loansRepository.findById(loanId);
        if (!current) throw new NotFoundError("Préstamo no encontrado");

        const changes: Partial<Loan> = {};
        if (data.userName !== undefined) changes.userName = this.requireString(data.userName, "userName");
        if (data.loanDate !== undefined) changes.loanDate = this.validateDate(data.loanDate, "loanDate");
        if (data.returned !== undefined) changes.returned = this.validateBoolean(data.returned, "returned");

        const returned = changes.returned ?? current.returned;
        const loanDate = changes.loanDate ?? current.loanDate;
        if (data.returnDate !== undefined) changes.returnDate = this.validateDate(data.returnDate, "returnDate");
        if (!returned && changes.returnDate !== undefined) {
            throw new BadRequestError("'returnDate' solo puede enviarse cuando el préstamo está devuelto");
        }
        if (!current.returned && returned && changes.returnDate === undefined) changes.returnDate = new Date();
        if (changes.returnDate && changes.returnDate < loanDate) {
            throw new BadRequestError("'returnDate' no puede ser anterior a 'loanDate'");
        }
        if (data.bookId !== undefined) {
            throw new BadRequestError("No se puede cambiar el libro de un préstamo existente");
        }
        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }

        const now = new Date();
        changes.updatedAt = now;
        const updated = await this.loansRepository.update(loanId, changes);
        if (!updated) throw new NotFoundError("Préstamo no encontrado");

        if (!current.returned && returned) {
            await this.booksRepository.update(current.bookId, { available: true, updatedAt: now });
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const loanId = this.toObjectId(id);
        const loan = await this.loansRepository.findById(loanId);
        if (!loan) throw new NotFoundError("Préstamo no encontrado");

        const deleted = await this.loansRepository.delete(loanId);
        if (!deleted) throw new NotFoundError("Préstamo no encontrado");
        if (!loan.returned) {
            await this.booksRepository.update(loan.bookId, { available: true, updatedAt: new Date() });
        }
    }

    private async requireAvailableBook(value: unknown) {
        const book = await this.booksRepository.findById(this.toObjectId(value));
        if (!book) throw new BadRequestError("El libro indicado no existe");
        if (!book.available) throw new BadRequestError("El libro indicado no está disponible");
        return book;
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private validateDate(value: unknown, field: string): Date {
        if (!(typeof value === "string" || value instanceof Date)) {
            throw new BadRequestError(`El campo '${field}' debe ser una fecha válida`);
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestError(`El campo '${field}' debe ser una fecha válida`);
        }
        return date;
    }

    private validateBoolean(value: unknown, field: string): boolean {
        if (typeof value !== "boolean") {
            throw new BadRequestError(`El campo '${field}' debe ser booleano`);
        }
        return value;
    }

    private toObjectId(value: unknown): ObjectId {
        if (typeof value !== "string" || !ObjectId.isValid(value)) {
            throw new BadRequestError(`Identificador inválido: ${String(value)}`);
        }
        return new ObjectId(value);
    }
}
