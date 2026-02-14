import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { ProductList } from "@/components/products/product-list";
import { desc } from "drizzle-orm";

export default async function ProductsPage() {
    const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));

    return (
        <main className="container mx-auto py-10 px-4">
            <ProductList initialProducts={products} />
        </main>
    );
}
