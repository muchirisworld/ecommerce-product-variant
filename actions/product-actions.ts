"use server";

import { db } from "@/db";
import { productsTable, productVariantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: {
    name: string;
    description?: string;
    options: { name: string; values: string[] }[];
    basePrice: number;
    baseStock: number;
}) {
    try {
        const [newProduct] = await db
            .insert(productsTable)
            .values({
                name: data.name,
                description: data.description,
                options: data.options,
            })
            .returning();

        // Generate variants
        if (data.options.length > 0) {
            const variantAttributes = generateCartesianProduct(data.options);

            const variantsToInsert = variantAttributes.map((attrs, index) => ({
                productId: newProduct.id,
                sku: `${data.name.toUpperCase().replace(/\s+/g, "-")}-${Object.values(attrs)
                    .join("-")
                    .toUpperCase()}-${index}`,
                price: data.basePrice,
                stock: data.baseStock,
                attributes: attrs,
            }));

            await db.insert(productVariantsTable).values(variantsToInsert);
        } else {
            // Single variant for products without options
            await db.insert(productVariantsTable).values({
                productId: newProduct.id,
                sku: `${data.name.toUpperCase().replace(/\s+/g, "-")}-DEFAULT`,
                price: data.basePrice,
                stock: data.baseStock,
                attributes: {},
            });
        }

        revalidatePath("/products");
        return { success: true, product: newProduct };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}

function generateCartesianProduct(options: { name: string; values: string[] }[]) {
    const results: Record<string, string>[] = [];

    function helper(index: number, current: Record<string, string>) {
        if (index === options.length) {
            results.push({ ...current });
            return;
        }

        const option = options[index];
        for (const value of option.values) {
            current[option.name] = value;
            helper(index + 1, current);
        }
    }

    helper(0, {});
    return results;
}

export async function updateProductAction(
    id: string,
    data: { name?: string; description?: string }
) {
    try {
        await db.update(productsTable).set(data).where(eq(productsTable.id, id));
        revalidatePath(`/products/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProductAction(id: string) {
    try {
        await db.delete(productsTable).where(eq(productsTable.id, id));
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}

export async function updateVariantAction(
    id: string,
    data: { sku?: string; price?: number; stock?: number }
) {
    try {
        await db
            .update(productVariantsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productVariantsTable.id, id));
        return { success: true };
    } catch (error) {
        console.error("Failed to update variant:", error);
        return { success: false, error: "Failed to update variant" };
    }
}

export async function bulkUpdateVariantsAction(
    updates: { id: string; sku?: string; price?: number; stock?: number }[]
) {
    try {
        // Sequential updates for simplicity in this example, 
        // but could be optimized with prepared statements or transaction if needed
        for (const update of updates) {
            const { id, ...fields } = update;
            await db
                .update(productVariantsTable)
                .set({ ...fields, updatedAt: new Date() })
                .where(eq(productVariantsTable.id, id));
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk update variants:", error);
        return { success: false, error: "Failed to bulk update variants" };
    }
}
