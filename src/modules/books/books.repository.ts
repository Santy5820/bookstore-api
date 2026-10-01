import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Book } from "./books.model";

export class BooksRepository {
    private collection(): Collection<Book> {
        return getDb().collection<Book>("books");
    }

    async create(data: Omit<Book, "_id">): Promise<Book> {
        const result = await this.collection().insertOne(data as Book);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Book[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Book | null> {
        return this.collection().findOne({ _id: id });
    }

    async findByIsbn(isbn: string, excludeId?: ObjectId): Promise<Book | null> {
        return this.collection().findOne({
            isbn,
            ...(excludeId && { _id: { $ne: excludeId } }),
        });
    }

    async hasByAuthorId(authorId: ObjectId): Promise<boolean> {
        const book = await this.collection().findOne(
            { authorId },
            { projection: { _id: 1 } },
        );
        return book !== null;
    }

    async update(id: ObjectId, changes: Partial<Book>): Promise<Book | null> {
        return this.collection().findOneAndUpdate(
            { _id: id },
            { $set: changes },
            { returnDocument: "after" },
        );
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}
