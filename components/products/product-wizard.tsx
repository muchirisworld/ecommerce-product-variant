"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Warning, Check, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createProductAction } from "@/actions/product-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Option {
    name: string;
    values: string[];
}

export function ProductWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [basePrice, setBasePrice] = useState(0);
    const [baseStock, setBaseStock] = useState(0);

    // Temps for option entry
    const [currentOptionName, setCurrentOptionName] = useState("");
    const [currentOptionValues, setCurrentOptionValues] = useState("");

    const addOption = () => {
        if (!currentOptionName || !currentOptionValues) {
            toast.error("Please provide both option name and values");
            return;
        }
        const values = currentOptionValues.split(",").map((v) => v.trim()).filter(Boolean);
        if (values.length === 0) {
            toast.error("Please provide at least one value");
            return;
        }

        setOptions([...options, { name: currentOptionName, values }]);
        setCurrentOptionName("");
        setCurrentOptionValues("");
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const variantCount = options.reduce((acc, opt) => acc * opt.values.length, options.length > 0 ? 1 : 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await createProductAction({
                name,
                description,
                options,
                basePrice: Math.round(basePrice * 100), // convert to cents
                baseStock,
            });

            if (result.success) {
                toast.success("Product and variants created successfully!");
                router.push("/products");
            } else {
                toast.error(result.error || "Failed to create product");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8 flex justify-center items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Tell us about your new product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" placeholder="e.g. Premium Hiking Boots" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" placeholder="Describe your product..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={() => setStep(2)} disabled={!name}>
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Options & Variants</CardTitle>
                                <CardDescription>Define how your product varies (Size, Color, etc.)</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Total Variants</p>
                                <p className={`text-2xl font-bold ${variantCount > 100 ? "text-orange-500" : "text-green-600"}`}>
                                    {variantCount}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border p-4 rounded-lg bg-muted/30">
                            <div className="space-y-2">
                                <Label>Option Name</Label>
                                <Input placeholder="e.g. Size" value={currentOptionName} onChange={(e) => setCurrentOptionName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Values (comma separated)</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="S, M, L" value={currentOptionValues} onChange={(e) => setCurrentOptionValues(e.target.value)} />
                                    <Button type="button" size="icon" onClick={addOption}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-md group">
                                    <div>
                                        <span className="font-semibold">{opt.name}:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {opt.values.map((v, i) => (
                                                <Badge key={i} variant="secondary">{v}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {options.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4 border-2 border-dashed rounded-md">
                                    No options added. This product will have a single default variant.
                                </p>
                            )}
                        </div>

                        {variantCount > 50 && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md flex gap-3 items-center text-orange-800 text-sm">
                                <Warning className="h-5 w-5 shrink-0" />
                                <p>Generating many variants might take a moment. You can still manage them easily in the next step.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={() => setStep(3)}>
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle>Base Values</CardTitle>
                        <CardDescription>Initial settings for all generated variants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Base Price ($)</Label>
                                <Input id="price" type="number" step="0.01" value={isNaN(basePrice) ? "" : basePrice} onChange={(e) => setBasePrice(e.target.value === "" ? NaN : parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Base Stock</Label>
                                <Input id="stock" type="number" value={isNaN(baseStock) ? "" : baseStock} onChange={(e) => setBaseStock(e.target.value === "" ? NaN : parseInt(e.target.value))} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
                            {isSubmitting ? "Generating..." : "Finish & Create"}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
