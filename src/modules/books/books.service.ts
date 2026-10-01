import { ObjectId } from "mongodb";
import { AuthorsRepository } from "../authors/authors.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { Book, BookDTO } from "./books.model";
import { BooksRepository } from "./books.repository";

export class BooksService {
    private readonly booksRepository = new BooksRepository();
    private readonly authorsRepository = new AuthorsRepository();

    async create(data: BookDTO): Promise<Book> {
        const title = this.requireString(data?.title, "title");
        const isbn = this.requireString(data?.isbn, "isbn");
        await this.ensureUniqueIsbn(isbn);

        const now = new Date();
        return this.booksRepository.create({
            title,
            isbn,
            authorId: await this.requireExistingAuthor(data?.authorId),
            ...(data.year !== undefined && { year: this.validateYear(data.year) }),
            available: data.available === undefined ? true : this.validateAvailable(data.available),
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Book[]> {
        return this.booksRepository.findAll();
    }

    async findById(id: string): Promise<Book> {
        const book = await this.booksRepository.findById(this.toObjectId(id));
        if (!book) throw new NotFoundError("Libro no encontrado");
        return book;
    }

    async update(id: string, data: BookDTO): Promise<Book> {
        const bookId = this.toObjectId(id);
        const changes: Partial<Book> = {};

        if (data.title !== undefined) changes.title = this.requireString(data.title, "title");
        if (data.isbn !== undefined) {
            const isbn = this.requireString(data.isbn, "isbn");
            await this.ensureUniqueIsbn(isbn, bookId);
            changes.isbn = isbn;
        }
        if (data.authorId !== undefined) changes.authorId = await this.requireExistingAuthor(data.authorId);
        if (data.year !== undefined) changes.year = this.validateYear(data.year);
        if (data.available !== undefined) changes.available = this.validateAvailable(data.available);

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }

        changes.updatedAt = new Date();
        const updated = await this.booksRepository.update(bookId, changes);
        if (!updated) throw new NotFoundError("Libro no encontrado");
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.booksRepository.delete(this.toObjectId(id));
        if (!deleted) throw new NotFoundError("Libro no encontrado");
    }

    private async ensureUniqueIsbn(isbn: string, excludeId?: ObjectId): Promise<void> {
        if (await this.booksRepository.findByIsbn(isbn, excludeId)) {
            throw new BadRequestError("El ISBN ya está registrado");
        }
    }

    private async requireExistingAuthor(value: unknown): Promise<ObjectId> {
        const authorId = this.toObjectId(value);
        if (!await this.authorsRepository.findById(authorId)) {
            throw new BadRequestError("El autor indicado no existe");
        }
        return authorId;
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private validateYear(value: unknown): number {
        if (typeof value !== "number" || !Number.isInteger(value)) {
            throw new BadRequestError("El campo 'year' debe ser un entero");
        }
        return value;
    }

    private validateAvailable(value: unknown): boolean {
        if (typeof value !== "boolean") {
            throw new BadRequestError("El campo 'available' debe ser booleano");
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
