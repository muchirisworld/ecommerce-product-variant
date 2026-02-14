"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bulkUpdateVariantsAction } from "@/actions/product-actions";
import { toast } from "sonner";
import { FloppyDisk, Table as TableIcon, ListBullets, CaretDown } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

interface Variant {
    id: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
}

interface Product {
    id: string;
    name: string;
    options: { name: string; values: string[] }[];
}

export function VariantManager({ product, initialVariants }: { product: Product, initialVariants: Variant[] }) {
    const [variants, setVariants] = useState(initialVariants);
    const [isSaving, setIsSaving] = useState(false);
    const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

    // Pivot by the first option by default
    const pivotOption = product.options[0]?.name;
    const pivotValues = product.options[0]?.values || ["Default"];

    const groupedVariants = useMemo(() => {
        const groups: Record<string, Variant[]> = {};
        if (!pivotOption) {
            groups["Default"] = variants;
        } else {
            pivotValues.forEach(val => {
                groups[val] = variants.filter(v => v.attributes[pivotOption] === val);
            });
        }
        return groups;
    }, [variants, pivotOption, pivotValues]);

    const handleInputChange = (id: string, field: keyof Variant, value: string | number) => {
        setVariants(prev => prev.map(v => {
            if (v.id === id) {
                return { ...v, [field]: field === 'price' ? Number(value) : value };
            }
            return v;
        }));
        setDirtyIds(prev => new Set(prev).add(id));
    };

    const handleSave = async () => {
        if (dirtyIds.size === 0) return;

        setIsSaving(true);
        try {
            const updates = variants
                .filter(v => dirtyIds.has(v.id))
                .map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: Math.round(v.price * 100), // convert back to cents if it was displayed as dollars
                    stock: Number(v.stock),
                }));

            const result = await bulkUpdateVariantsAction(updates);
            if (result.success) {
                toast.success("Changes saved successfully");
                setDirtyIds(new Set());
            } else {
                toast.error("Failed to save changes");
            }
        } catch (err) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-muted-foreground">Manage variants and inventory</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving || dirtyIds.size === 0} className="min-w-[120px]">
                    {isSaving ? "Saving..." : (
                        <>
                            <FloppyDisk className="mr-2 h-4 w-4" />
                            Save Changes
                            {dirtyIds.size > 0 && <Badge className="ml-2 bg-primary-foreground text-primary">{dirtyIds.size}</Badge>}
                        </>
                    )}
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ListBullets />
                        <span>Grouped by <strong>{pivotOption || "None"}</strong></span>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={pivotValues[0]} className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList className="bg-muted/50 p-1">
                                {pivotValues.map(val => (
                                    <TabsTrigger key={val} value={val} className="px-6">
                                        {val}
                                        <Badge variant="outline" className="ml-2 text-[10px] px-1 h-4 min-w-[16px] flex items-center justify-center">
                                            {groupedVariants[val]?.length || 0}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {pivotValues.map(val => (
                            <TabsContent key={val} value={val} className="animate-in fade-in-50 duration-300">
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[300px]">Variant</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead className="w-[120px]">Price ($)</TableHead>
                                                <TableHead className="w-[120px]">Stock</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedVariants[val]?.map((variant) => (
                                                <TableRow key={variant.id} className={dirtyIds.has(variant.id) ? "bg-primary/5" : ""}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(variant.attributes).map(([k, v]) => (
                                                                <Badge key={k} variant="outline" className="font-normal">
                                                                    {k}: {v}
                                                                </Badge>
                                                            ))}
                                                            {Object.keys(variant.attributes).length === 0 && "Default Variant"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={variant.sku}
                                                            onChange={(e) => handleInputChange(variant.id, 'sku', e.target.value)}
                                                            className="h-8 border-none bg-transparent focus-visible:ring-1 hover:bg-muted/50 transition-colors"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.price / 100} // Assuming internal state is cents for variants but manager might handle display
                                                            onChange={(e) => handleInputChange(variant.id, 'price', e.target.value)}
                                                            className="h-8 border-none bg-transparent focus-visible:ring-1 hover:bg-muted/50 transition-colors"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => handleInputChange(variant.id, 'stock', e.target.value)}
                                                            className="h-8 border-none bg-transparent focus-visible:ring-1 hover:bg-muted/50 transition-colors"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
