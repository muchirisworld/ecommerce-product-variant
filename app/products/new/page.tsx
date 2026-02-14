import { ProductWizard } from "@/components/products/product-wizard";

export default function NewProductPage() {
    return (
        <main className="container mx-auto py-10 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
                <p className="text-muted-foreground">Follow the steps to set up your product and its variations.</p>
            </div>
            <ProductWizard />
        </main>
    );
}
