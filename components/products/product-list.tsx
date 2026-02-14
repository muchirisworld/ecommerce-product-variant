"use client";

import { useState } from "react";
import { Plus, Package, PencilLine, Trash, Table } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProductAction } from "@/actions/product-actions";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
}

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState(initialProducts);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const result = await deleteProductAction(id);
        if (result.success) {
            setProducts(products.filter((p) => p.id !== id));
            toast.success("Product deleted successfully");
        } else {
            toast.error("Failed to delete product");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <Button asChild className="cursor-pointer">
                    <Link href="/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                {product.name}
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                {product.description || "No description provided."}
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/products/${product.id}`}>
                                        <Table className="mr-2 h-4 w-4" />
                                        Variants
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <Package className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">Click the button above to create your first product.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
