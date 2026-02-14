import { db } from "@/db";
import { productsTable, productVariantsTable } from "@/db/schema";
import { VariantManager } from "@/components/products/variant-manager";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await db.query.productsTable.findFirst({
        where: eq(productsTable.id, id),
    });

    if (!product) {
        notFound();
    }

    const variants = await db.query.productVariantsTable.findMany({
        where: eq(productVariantsTable.productId, id),
        orderBy: [desc(productVariantsTable.createdAt)],
    });

    return (
        <main className="container mx-auto py-10 px-4">
            <VariantManager product={product} initialVariants={variants} />
        </main>
    );
}
