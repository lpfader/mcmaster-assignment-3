import Router from "@koa/router";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db";

const createRouter = new Router();

interface BookInput {
    id?: string;
    name: string;
    author: string;
    description: string;
    price: number;
    image: string;
}

function validateBookInput(body: any): { valid: boolean; error?: string; book?: BookInput } {
    if (!body || typeof body !== "object") {
        return { valid: false, error: "Request body must be an object" };
    }

    const { id, name, author, description, price, image } = body;

    if (id !== undefined && typeof id !== "string") {
        return { valid: false, error: "Book ID must be a string if provided" };
    }

    if (typeof name !== "string" || name.trim() === "") {
        return { valid: false, error: "Name must be a non-empty string" };
    }

    if (typeof author !== "string" || author.trim() === "") {
        return { valid: false, error: "Author must be a non-empty string" };
    }

    if (typeof description !== "string") {
        return { valid: false, error: "Description must be a string" };
    }

    if (typeof price !== "number" || isNaN(price) || price < 0) {
        return { valid: false, error: "Price must be a non-negative number" };
    }

    if (typeof image !== "string") {
        return { valid: false, error: "Image must be a string" };
    }

    return {
        valid: true,
        book: { id, name, author, description, price, image },
    };
}

// POST /books
createRouter.post("/books", async (ctx) => {
    try {
        const validation = validateBookInput(ctx.request.body as any);

        if (!validation.valid) {
            ctx.status = 400;
            ctx.body = { error: validation.error };
            return;
        }

        const book = validation.book!;
        const db = await getDatabase();
        const collection = db.collection("books");

        if (book.id) {
            if (!ObjectId.isValid(book.id)) {
                ctx.status = 400;
                ctx.body = { error: "Invalid id format" };
                return;
            }

            const oid = new ObjectId(book.id);

            await collection.updateOne(
                { _id: oid },
                {
                    $set: {
                        name: book.name,
                        author: book.author,
                        description: book.description,
                        price: book.price,
                        image: book.image,
                    },
                },
                { upsert: true },
            );

            ctx.status = 200;
            ctx.body = { id: book.id };
            return;
        }

        const result = await collection.insertOne({
            name: book.name,
            author: book.author,
            description: book.description,
            price: book.price,
            image: book.image,
        });

        ctx.status = 201;
        ctx.body = { id: result.insertedId.toString() };
    } catch (err: any) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
});

// PUT /books/:id
createRouter.put("/books/:id", async (ctx) => {
    try {
        const id = ctx.params.id;

        if (!ObjectId.isValid(id)) {
            ctx.status = 400;
            ctx.body = { error: "Invalid id format" };
            return;
        }

        const validation = validateBookInput(ctx.request.body as any);

        if (!validation.valid) {
            ctx.status = 400;
            ctx.body = { error: validation.error };
            return;
        }

        const book = validation.book!;
        const db = await getDatabase();
        const collection = db.collection("books");

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name: book.name,
                    author: book.author,
                    description: book.description,
                    price: book.price,
                    image: book.image,
                },
            },
        );

        if (result.matchedCount === 0) {
            ctx.status = 404;
            ctx.body = { error: "Book not found" };
            return;
        }

        ctx.status = 200;
        ctx.body = { id };
    } catch (err: any) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
});

export default createRouter;
