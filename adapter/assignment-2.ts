import assignment1 from "./assignment-1";

export type BookID = string;

export interface Book {
    id?: BookID;
    name: string;
    author: string;
    description: string;
    price: number;
    image: string;
}

async function listBooks(filters?: Array<{ from?: number; to?: number }>): Promise<Book[]> {
    return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
    const url = book.id ? `http://localhost:3000/books/${book.id}` : "http://localhost:3000/books";

    const method = book.id ? "PUT" : "POST";

    const result = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(book),
    });

    if (!result.ok) {
        throw new Error(
            `Failed to ${book.id ? "update" : "create"} book: ${result.status} ${result.statusText}`,
        );
    }

    const data = await result.json();

    return data.id;
}

async function removeBook(bookId: BookID): Promise<void> {
    const result = await fetch(`http://localhost:3000/books/${bookId}`, {
        method: "DELETE",
    });

    if (!result.ok) {
        throw new Error(`Failed to delete book: ${result.status} ${result.statusText}`);
    }
}

const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks,
};
