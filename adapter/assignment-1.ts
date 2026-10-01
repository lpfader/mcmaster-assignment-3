export interface Book {
    name: string;
    author: string;
    description: string;
    price: number;
    image: string;
}

// If you have multiple filters, a book matching any of them is a match.
async function listBooks(filters?: Array<{ from?: number; to?: number }>): Promise<Book[]> {
    const query =
        filters
            ?.map(({ from, to }, index) => {
                let result = "";
                if (typeof from === "number") {
                    result += `&filters[${index}][from]=${from}`;
                }
                if (typeof to === "number") {
                    result += `&filters[${index}][to]=${to}`;
                }
                return result;
            })
            .join("&") ?? "";

    // We then make the request
    const result = await fetch(`http://localhost:3000/books?${query}`);
    if (result.ok) {
        // And if it is valid, we parse the JSON result and return it.
        return (await result.json()) as Book[];
    } else {
        console.log("Failed to fetch books: ", await result.text());
        throw new Error("Failed to fetch books");
    }
}

const assignment = "assignment-1";

export default {
    assignment,
    listBooks,
};
