import Router from "@koa/router";
import type { Book } from "../../adapter/assignment-3";
import { getDatabase } from "../db";

const listRouter = new Router();

interface RawFilter {
    from?: string;
    to?: string;
    name?: string;
    author?: string;
}

interface ParsedFilter {
    from?: number;
    to?: number;
    name?: string;
    author?: string;
}

listRouter.get("/books", async (ctx) => {
    const rawFilters = ctx.query.filters as RawFilter[] | undefined;

    try {
        let bookList = await getBooksFromDatabase();

        if (rawFilters && Array.isArray(rawFilters) && rawFilters.length > 0) {
            const filters = parseFilters(rawFilters);
            if (filters === null) {
                ctx.status = 400;
                ctx.body = { error: "Invalid filters." };
                return;
            }
            bookList = filterBooks(bookList, filters);
        }

        ctx.body = bookList;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: `Failed to fetch books due to: ${error}` };
    }
});

function parseFilters(rawFilters: RawFilter[]): ParsedFilter[] | null {
    const parsed: ParsedFilter[] = [];

    for (const raw of rawFilters) {
        const filter: ParsedFilter = {};

        if (raw.from !== undefined) {
            const from = parseFloat(raw.from);
            if (isNaN(from)) return null;
            filter.from = from;
        }

        if (raw.to !== undefined) {
            const to = parseFloat(raw.to);
            if (isNaN(to)) return null;
            filter.to = to;
        }

        if (raw.name !== undefined) {
            if (typeof raw.name !== "string" || raw.name.trim() === "") return null;
            filter.name = raw.name;
        }

        if (raw.author !== undefined) {
            if (typeof raw.author !== "string" || raw.author.trim() === "") return null;
            filter.author = raw.author;
        }

        if (filter.from !== undefined && filter.to !== undefined && filter.from > filter.to) {
            return null;
        }

        if (Object.keys(filter).length === 0) {
            return null;
        }

        parsed.push(filter);
    }

    return parsed;
}

async function getBooksFromDatabase(): Promise<Book[]> {
    const db = getDatabase();
    const books = await db.collection("books").find({}).toArray();
    return books.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        author: doc.author,
        description: doc.description,
        price: doc.price,
        image: doc.image,
    }));
}

function filterBooks(bookList: Book[], filters: ParsedFilter[]): Book[] {
    return bookList.filter((book) =>
        filters.some((filter) => {
            const matchesFrom = filter.from === undefined || book.price >= filter.from;
            const matchesTo = filter.to === undefined || book.price <= filter.to;
            const matchesName =
                filter.name === undefined ||
                book.name.toLowerCase().includes(filter.name.toLowerCase());
            const matchesAuthor =
                filter.author === undefined ||
                book.author.toLowerCase().includes(filter.author.toLowerCase());

            return matchesFrom && matchesTo && matchesName && matchesAuthor;
        }),
    );
}

export default listRouter;