import Router from "@koa/router";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db";

const deleteRouter = new Router();

// Delete a book by ID
deleteRouter.delete("/books/:id", async (ctx) => {
    try {
        const id = ctx.params.id;

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            ctx.status = 400;
            ctx.body = { error: "Invalid book ID format" };
            return;
        }

        const db = await getDatabase();
        const collection = db.collection("books");

        // Attempt deletion
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            ctx.status = 404;
            ctx.body = { error: "Book not found" };
            return;
        }

        // Success → 204 No Content
        ctx.status = 204;
    } catch (err: any) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
});

export default deleteRouter;
