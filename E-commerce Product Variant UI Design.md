# **Advanced Product Data Modeling and Interface Design for High-Cardinality Ecommerce Platforms**

## **1\. The Combinatorial Conundrum in Digital Commerce**

The architecture of modern ecommerce platforms faces a pivotal stress test at the intersection of inventory diversity and user interface design. As merchants transition from simple catalog listings to complex, multi-dimensional product offerings, the underlying data models often fracture under the weight of what is mathematically known as combinatorial explosion. The user query regarding a product with four distinct option tags—yielding 256 theoretical combinations—illustrates a fundamental threshold where standard list-based interfaces and simplistic database schemas fail. This report provides an exhaustive analysis of the architectural patterns, user interface paradigms, and platform capabilities required to manage high-cardinality product variants effectively.

### **1.1 Mathematical Foundations of Variant Cardinality**

To design a robust store management dashboard, one must first internalize the mathematical reality of product variants. A product variant is the concrete realization of a specific intersection of attribute values. In a Cartesian product model, the total number of variants (![][image1]) is defined as the product of the cardinality of each option set (![][image2]).

![][image3]  
In the specific scenario provided, where a merchant utilizes four option tags (e.g., Size, Color, Material, Style), and assuming a conservative cardinality of four values per option, the calculation yields ![][image4] variants. While 256 database records represent a trivial load for modern relational or NoSQL databases, the challenge lies in the **Human-Computer Interaction (HCI)** layer and the **Document Object Model (DOM)** rendering performance within the browser.

When a fifth dimension is introduced—perhaps "Sleeve Length" or "Fit Type"—the total doubles to 512\. A sixth dimension pushes the count to 1,024. This exponential growth curve necessitates a shift from linear data entry interfaces to matrix-based or algorithmic configuration tools. Without this shift, the merchant dashboard becomes a bottleneck, characterized by unacceptably high cognitive load, increased error rates in pricing and inventory data, and severe browser performance degradation due to excessive DOM nodes.

### **1.2 The Distinction Between Variants and Modifiers**

A critical architectural distinction often missed in nascent platform development is the separation of **Variants** (SKUs) from **Modifiers** (Options). This distinction is the primary mechanism for mitigating combinatorial explosion.

**Variants** represent unique physical stock keeping units. They are distinct entities in the warehouse, requiring specific inventory tracking, weight definitions for shipping, and unique SKU codes. If a specific combination (e.g., Red/Small/Cotton) runs out of stock, it cannot be sold.

**Modifiers**, conversely, represent customization or attributes that do not fundamentally alter the stock keeping unit or are manufactured on demand without discrete inventory tracking. Examples include text engraving, gift wrapping options, or minor component swaps that do not warrant a unique SKU in the primary catalog.

In the case of the 256-variant problem, the platform architect must ask: Do all four option tags define inventory? If "Style" refers to a visual customization applied to a base product at the time of packing, treating it as a modifier rather than a variant reduces the combinatorial load from ![][image5] (256) to ![][image6] (64). Leading platforms like **BigCommerce** explicitly separate these concepts in their data model, allowing merchants to attach hundreds of modifiers without generating a corresponding number of inventory rows, thereby preserving system performance and UI usability.

### **1.3 The Business Impact of Poor Interface Design**

The failure to provide an adequate interface for high-cardinality products results in tangible business losses. For the merchant, an inefficient UI translates to hours of wasted labor during catalog updates. If a merchant needs to increase the price of all "Silk" variants by $5.00, a linear interface requiring 64 individual clicks and inputs is functionally unusable. This friction leads to "stale" catalogs where pricing and inventory data drift from reality, causing overselling (selling out-of-stock items) or underselling (failing to list available stock).

Furthermore, the "brute force" approach of generating all mathematical combinations often creates "ghost variants"—combinations that are theoretically possible but physically non-existent (e.g., a "Wool" t-shirt in "Neon Pink," a combination the manufacturer never produced). If the UI forces the generation of these invalid rows, the merchant must manually delete or disable them, a process prone to human error. A superior platform architecture implements **Exclusion Logic** or **Conditional Availability** at the generation stage, preventing invalid data from ever polluting the database.

## ---

**2\. Comparative Analysis of Market Leaders**

Analyzing how established platforms navigate the variant management challenge reveals a spectrum of strategies, ranging from rigid constraint-based models to flexible, matrix-driven architectures. This section dissects the approaches of Shopify, BigCommerce, Adobe Commerce (Magento), and modern headless solutions to identify best-in-class patterns.

### **2.1 Shopify: The Constraint-Based Simplicity Model**

Shopify has historically prioritized simplicity and ease of use, a philosophy that led to significant architectural constraints regarding variants. For years, the platform enforced a strict limit of 100 variants per product and a maximum of three options (e.g., Size, Color, Material). While these limits have recently been relaxed for enterprise plans, the core UI patterns remain instructive for their focus on reducing complexity for the average user.

#### **2.1.1 The Additive UI Workflow**

Shopify’s interface employs an additive workflow for variant creation. The merchant begins with a master product and adds option names (e.g., "Size") followed by tag-based values (S, M, L). As values are entered, the system automatically computes the Cartesian product and appends rows to a table below the option inputs.

This pattern works exceptionally well for low-cardinality products (e.g., 10-20 variants). It provides immediate visual feedback and requires zero configuration to generate the initial list. However, for the user's specific use case of 256 variants, this pattern is catastrophic. Entering the fourth option would trigger a massive DOM update, likely freezing the browser as it attempts to render hundreds of rows with editable inputs for price, SKU, and barcode simultaneously.

#### **2.1.2 Bulk Management and Metafields**

To mitigate the limitations of the list view, Shopify introduced a "Bulk Editor" interface—a spreadsheet-like view that overtakes the entire screen. This tool allows merchants to edit specific fields (like Price or Inventory) across many rows efficiently. The architectural lesson here is the **decoupling of creation and management**. The creation screen focuses on structure (Options/Values), while the bulk editor focuses on data population.

Furthermore, Shopify’s reliance on **Apps** and **Metafields** highlights a strategy of extensibility. When merchants hit the 100-variant limit, they are often directed to third-party apps that implement "Virtual Variants" or "Combined Listings." These apps create separate product records for each color (e.g., "Red Shirt," "Blue Shirt") and stitch them together on the storefront to appear as a single product. This **Split-Product Architecture** is a valid strategy for handling extreme cardinality (1000+ variants) by sharding the data into manageable parent-child relationships.

### **2.2 BigCommerce: The Master of Complexity**

BigCommerce positions itself as the platform of choice for complex catalogs, particularly in the B2B sector where high variant counts are common. Its architecture offers a more nuanced handling of the variant-modifier dichotomy.

#### **2.2.1 Option Sets and SKU Generation**

BigCommerce utilizes a concept known as **Option Sets** (in v2) or shared **Variant Options** (in v3). This allows merchants to define a set of attributes (e.g., "Men's Shoe Sizes") once and apply it to thousands of products. This inheritance model reduces data redundancy and simplifies global updates—if a new size is added to the set, it can propagate to all associated products.

The platform's UI for variant generation is distinctively matrix-oriented. Unlike Shopify's automatic generation, BigCommerce allows for a more controlled generation process. It identifies **SKU-generating options** (Variants) versus **non-SKU options** (Modifiers). This is the precise solution to the "256 combinations" problem: if the merchant designates only three of the four tags as inventory-tracking, the system generates 64 variants, while the fourth tag remains a selectable attribute on the product page that does not spawn database rows.

#### **2.2.2 The SKU Generation Matrix**

BigCommerce provides a robust SKU generation tool that allows merchants to define patterns for automatic SKU creation (e.g., {ParentSKU}-{Color}-{Size}). This automation is essential for high-cardinality catalogs, as manually typing 256 unique SKU codes is prone to error. The interface also supports **conditional logic** within the option configuration, allowing merchants to hide certain values based on previous selections (e.g., if "Material" is "Leather," hide "Neon Pink" as a color option). This prevents the creation of invalid orders and declutters the storefront UI.

### **2.3 Adobe Commerce (Magento): The Configuration Wizard**

Adobe Commerce (formerly Magento) offers perhaps the most sophisticated, albeit complex, UI pattern for variant creation: the **Product Configurations Wizard**. This pattern is directly applicable to the user's need for a custom dashboard solution.

#### **2.3.1 Step-by-Step Configuration Workflow**

Instead of an inline form, Magento launches a multi-step modal wizard that guides the user through the generation process:

1. **Select Attributes:** The user chooses which global attributes (Color, Size) drive the variations.  
2. **Select Values:** The user checks specific values for this product (e.g., Red, Blue, Green, but not Black).  
3. **Bulk Images and Pricing (The Pivot Step):** This is the wizard's most powerful feature. It asks the merchant, "Do images vary by Color?" If selected, the UI presents a simplified uploader for each color (Red, Blue, Green). The system then automatically applies the "Red" image to all "Red/Small," "Red/Medium," and "Red/Large" variants. This **Bulk Application Logic** reduces the workload from assigning 256 images to assigning just 4 (one per color).  
4. **Generation:** Finally, the system generates the matrix.

This workflow specifically addresses the data entry bottleneck. By abstracting the shared attributes (Price, Images) to the attribute level rather than the variant level, it reduces ![][image7] actions to ![][image8] actions.

### **2.4 PIM Systems: Akeneo and the Family Variant Model**

For enterprise-grade variant management, Product Information Management (PIM) systems like **Akeneo** offer a superior data model that ecommerce platforms often lack: the **Two-Axis Family Variant**.

#### **2.4.1 Hierarchical Variation**

Akeneo recognizes that flattening 256 variants into a single list destroys usability. Instead, it models variants hierarchically:

1. **Root Product Model:** The abstract parent (e.g., "The Polo Shirt").  
2. **Level 1 Variation (Sub-Product Model):** A grouping entity (e.g., "The Red Polo Shirt"). This level holds data specific to the color, such as images and descriptions.  
3. **Level 2 Variation (Variant Product):** The leaf node (e.g., "The Red Polo Shirt, Size S"). This level holds only the specific data like SKU and technical dimensions.

In the UI, this manifests as a **Grouped View**. The user does not see a list of 256 items. They see a list of 16 "Color/Material" groups. Clicking a group expands it to reveal the 16 "Size/Style" variants within. This **Progressive Disclosure** pattern reduces the cognitive load significantly, allowing the merchant to navigate a massive catalog with the same ease as a small one.

## ---

**3\. User Interface Design Patterns for High-Cardinality Management**

Based on the analysis of market leaders and the specific constraints of the user's 256-variant problem, we can distill a set of definitive UI design patterns. These patterns solve the core challenges of creation, visualization, and management.

### **3.1 The Exclusion Logic Wizard (Creation Pattern)**

The most effective way to handle 256 combinations is to recognize that in reality, not all combinations exist. A "Creation Wizard" with built-in exclusion logic is the gold standard for this use case.

**Phase 1: Definition:** The user selects the four Option types (Size, Color, Material, Style).

**Phase 2: Intersection Analysis:** The system presents a logic builder rather than a raw grid.

* *UI Component:* "Rule Builder."  
* *Interaction:* "Add Constraint: IF \[Material\] is 'Wool', THEN cannot be 'Sport'."  
* *Visual Feedback:* A live counter updates dynamically: "Total Combinations: 240 (16 excluded)."

**Phase 3: The Matrix Selection Grid:**

For the remaining combinations, display a visualized grid. Since 4 dimensions are hard to visualize on a 2D screen, use a **Pivoted Table**.

* *Y-Axis:* Concatenation of Option 1 & 2 (e.g., "Red \- Cotton").  
* *X-Axis:* Concatenation of Option 3 & 4 (e.g., "Small \- Crew").  
* *Cells:* Checkboxes indicating "Exists."  
  This allows the merchant to visually scan and uncheck blocks of invalid variants (e.g., "We don't make X-Large in Silk") before they are ever created in the database.

### **3.2 The Master-Detail View (Visualization Pattern)**

Once the variants are created, displaying 256 rows in a linear table is poor UX. The **Master-Detail** or **Tabbed Pivot** pattern is required.

**The Pivot Control:**

At the top of the variant list, provide a "Group By" dropdown.

* *Selection:* "Group by Color."  
* *Result:* The UI renders tabs or accordion headers for each Color (Red, Blue, Green, Black).

**The Scoped List:**

Clicking the "Red" tab reveals only the 64 variants associated with Red. This reduces the DOM load and the user's cognitive load by 75%. Within this view, a secondary filter (e.g., "Filter by Material") can further reduce the list to a manageable 16 items.

**Status Aggregation:**

The collapsed tabs/accordions must carry metadata bubbles.

* *Example:* The "Red" tab displays a yellow warning icon if any variant within it is low on stock, or a red icon if any variant is missing a price. This allows the merchant to scan the high-level groups for issues without opening every single one.

### **3.3 The Spreadsheet Interface (Management Pattern)**

For B2B or high-volume merchants, the primary interaction mode is **Bulk Data Entry**. The UI should mimic Excel or Google Sheets.

**Key Features:**

* **Keyboard Navigation:** The user must be able to navigate cells using arrow keys.  
* **Copy/Paste Support:** The ability to copy a column of prices from an external spreadsheet and paste it directly into the dashboard grid.  
* **Drag-to-Fill:** A handle on the bottom-right of a selected cell allows the user to drag down to propagate a value (e.g., Price: $19.99) to the next 50 rows.  
* **Validation Highlighting:** Invalid cells (e.g., negative inventory, missing SKU) should be highlighted in red immediately with tooltips explaining the error.

### **3.4 Visualizing Variant Relationships**

In complex systems, understanding the dependency between options is difficult. A **Dependency Graph** or **Tree Visualization** can be a powerful auxiliary view.

* *Root:* Product.  
* *Branches:* Option 1 Values.  
* *Sub-branches:* Option 2 Values.  
* *Leaves:* Variants.  
  This visual representation helps merchants identify unbalanced catalogs (e.g., "Why does the Blue branch have no Large leaves?").

## ---

**4\. Technical Architecture and Implementation Roadmap**

Implementing these UI patterns requires a sophisticated underlying technical architecture. A standard REST API and a basic React state implementation will likely fail under the load of 1000+ editable fields (256 variants ![][image9] 5 fields each).

### **4.1 Frontend Architecture: Managing High-Frequency State**

The dashboard will likely be built using a Single Page Application (SPA) framework like React, Vue, or Angular. The primary technical challenge is **Rendering Performance**.

#### **4.1.1 Virtualization (Windowing)**

Rendering 256 complex table rows, each containing event listeners and input fields, will bloat the DOM and cause scroll lag. **Virtualization** is mandatory.

* **Library:** Use react-window or tanstack-virtual.  
* **Mechanism:** Only render the rows currently visible in the viewport (e.g., 20 rows). As the user scrolls, recycle the DOM nodes and inject new data.  
* **Implication:** Standard CSS layouts (like flexible height rows) become difficult. Fixed-height rows are preferred for virtualization performance.

#### **4.1.2 State Management**

Storing the form state for 1,280 fields in a single root React useState object will trigger a full app re-render on every keystroke, causing severe typing latency.

* **Pattern 1: Uncontrolled Components:** Use uncontrolled inputs (ref) for the grid cells. Only sync data to the global store on onBlur (when focus leaves the field). This isolates the re-render to the individual cell.  
* **Pattern 2: Atom-Based State:** Use libraries like **Recoil** or **Jotai**. Each cell subscribes to its own distinct atom of state. Updating Cell A does not affect Cell B, even if they share a parent component.  
* **Pattern 3: Form Libraries:** Use react-hook-form with useFieldArray. This library is specifically optimized for large lists of inputs, using refs to manage registration and validation without triggering React renders.

### **4.2 Database Schema: Handling High Cardinality**

The database design determines the flexibility of the variant system. The traditional Entity-Attribute-Value (EAV) model is flexible but slow for reads. A JSON-based hybrid model is often superior for modern ecommerce.

**Recommended Schema (PostgreSQL/JSONB):**

| Table | Column | Type | Description |
| :---- | :---- | :---- | :---- |
| **Products** | id | UUID | Primary Key |
|  | title | Text | "The Horizon T-Shirt" |
|  | options | JSONB | },...\] |
| **Variants** | id | UUID | Primary Key |
|  | product\_id | UUID | FK to Products |
|  | sku | Text | Unique constraint |
|  | attributes | JSONB | {"Color": "Red", "Size": "S", "Material": "Cotton"} |
|  | prices | JSONB | {"USD": 2000, "EUR": 1800} |
|  | inventory | JSONB | {"warehouse\_a": 10, "warehouse\_b": 5} |

**Advantages of JSONB for Attributes:**

* **Flexibility:** You do not need to alter table schemas to add new option types (e.g., "Fit").  
* **Indexing:** Modern databases (PostgreSQL, MySQL 8\) allow efficient indexing of JSON keys, enabling fast filtered queries (e.g., "Find all variants where attributes-\>\>'Color' \= 'Red'").

### **4.3 API Design: Batching and Asynchronicity**

Sending a payload with 256 variants in a single synchronous REST POST request can lead to timeouts (504 Gateway Timeout), especially if the server performs image processing or third-party logic (ERP sync) during the save.

**Strategy 1: Asynchronous Processing**

* **Action:** The user clicks "Save."  
* **UI:** The UI enters a "Saving..." state but returns control immediately (Optimistic UI) or shows a progress bar.  
* **Backend:** The server accepts the payload, places it in a message queue (e.g., Redis/BullMQ), and returns a job\_id.  
* **Polling:** The frontend polls the job status endpoint to update the progress bar ("Processed 120/256 variants...").

**Strategy 2: Delta Updates (PATCH)**

* Never send the full dataset if only one price changed.  
* The frontend tracks "dirty" fields. On save, it sends a PATCH request containing only the IDs and the changed fields of the modified variants. This reduces payload size from megabytes to kilobytes.

## ---

**5\. Integrating the Missing Requirements: A Unified Solution**

The original query explicitly asked, *"How do I translate that to the UI?"* The following section provides a concrete, narrative walkthrough of the proposed solution, synthesizing the "Matrix Wizard" and "Spreadsheet Management" patterns.

### **5.1 The "Variant Constructor" UI Walkthrough**

Imagine a merchant, Sarah, adding a "Custom Hiking Boot" to your platform. She has four options: **Color** (3), **Size** (10), **Material** (2), and **Sole Type** (3). Total combinations: 180\.

**Step 1: The Option Definition Panel**

Sarah enters the "Products" section. She sees a card titled "Options." She adds "Color" and types "Red, Black, Brown." She adds the other three options similarly.

* *Crucial UI Element:* A **Live Variant Counter** sits in the corner. It starts at 0\. As she adds "Size," it jumps to 30\. As she adds "Sole Type," it jumps to 180\. The counter changes color from Green to Orange, subtly warning her of the complexity.

**Step 2: The Exclusion Logic Builder (The "Sanity Check")**

Before generating, Sarah sees a button: "Limit Combinations." She knows that "Leather" boots (Material) never come with "Lightweight" soles (Sole Type).

She clicks the button and sees a sentence-builder interface:

* *If* **\[Material\]** *is* **\[Leather\]**, *then* \*\*\*\* *cannot be* **\[Lightweight\]**.  
  The Live Counter drops from 180 to 150\. This step saves her from manually deleting 30 rows later.

**Step 3: The Bulk Context Wizard**

Next, the system asks: "How do images and prices vary?"

Sarah selects **Color** for images and **Material** for price.

* The UI presents three image dropzones: Red, Black, Brown. She uploads one image for "Red," and the system understands this applies to all 50 "Red" variants.  
* The UI presents two price inputs: Synthetic (Base Price) and Leather (+$20). She enters the data once.

**Step 4: The Generation & Matrix View**

She clicks "Generate." The system builds the 150 variants.

Instead of a long list, she sees a **Tabbed Interface** grouped by Color.

* **Tab 1: Red (50 variants)**  
* **Tab 2: Black (50 variants)**  
* **Tab 3: Brown (50 variants)**

She clicks "Red." A virtualized spreadsheet appears. The columns are SKU, Size, Material, Sole, Price, Stock.

* The **Price** column is already populated based on her Wizard inputs ($100 for Synthetic, $120 for Leather).  
* The **Image** column shows the Red boot thumbnail she uploaded.  
* The **SKU** column is pre-filled: BOOT-RED-08-SYN-LW.

**Step 5: Exception Management**

Sarah realizes the "Red / Size 12 / Leather" boot is on clearance. She finds that specific row in the grid.

* She clicks the Price cell. It becomes an editable input.  
* She changes $120 to $90. The cell border turns blue to indicate an "Override."  
* She hits "Save." The system sends a differential patch to the server.

### **5.2 Mobile Considerations**

A common oversight is how this translates to mobile devices. A 10-column spreadsheet is unusable on a phone.

* **Card View Strategy:** On mobile, the "Table" must transmute into a "Card List."  
* **Search-First Interaction:** Instead of scrolling 150 cards, the mobile UI should default to a Search/Filter bar. "Scan Barcode" or "Search SKU" becomes the primary action.  
* **Action Sheet:** Tapping a variant card opens a focused Action Sheet for quick edits (Update Stock, Change Price) rather than full inline editing.

## ---

**6\. Future-Proofing: Beyond the Matrix**

As the platform matures, the architectural decisions made today regarding variants will dictate future capabilities.

### **6.1 AI and Predictive Variant Generation**

Future iterations of the platform could leverage Machine Learning to assist in the variant generation process. An AI model trained on vertical-specific data could suggest:

* **Smart Exclusion:** "In the Footwear category, Size 15 is rarely produced in Neon Green. Do you want to exclude this?"  
* **Price Optimization:** "Based on competitor data, 'Leather' variants typically command a 15% markup. Apply this rule?"

### **6.2 Dynamic Bundling and Virtual Variants**

The ultimate solution to high cardinality is to break the rigid link between the "Product Page" and the "Inventory Item."

**Composable Commerce** allows for **Virtual Variants**:

* A "Gift Set" product is not a database row with its own inventory. It is a virtual wrapper that bundles "Soap A" and "Towel B."  
* When a customer buys the bundle, the system deducts inventory from the component SKUs.  
  This architecture allows for infinite "marketing variants" without bloating the "inventory variants" table.

### **6.3 Performance Benchmarks**

To ensure the "best" handling, the platform must meet specific performance KPIs:

* **Time to Interactive (TTI):** The variant matrix must be editable within 500ms of page load, regardless of row count.  
* **Generation Speed:** Generating 1,000 variants should take less than 2 seconds on the frontend (using Web Workers to prevent UI freezing).  
* **API Latency:** Bulk updates of 500 rows should complete in under 1 second.

## **7\. Conclusion**

The implementation of a store management dashboard for high-cardinality products is a defining challenge in ecommerce engineering. It requires moving beyond the simplistic "add a row" mentality to embrace a **Systems Thinking** approach. By differentiating between variants and modifiers, implementing exclusion logic wizards, utilizing virtualized rendering technologies, and adopting a two-axis hierarchical data model, a platform can manage the complexity of 256—or even 2,560—variants with elegance. The "best" platform is not the one that allows the most variants, but the one that makes the most variants feel like the fewest.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAaCAYAAADFTB7LAAACP0lEQVR4Xu2WW4hNcRTGP5eUUnKJcUm5FKEYpabwMCLK5Ym8zKSUJvHCy7iV0fAwkzyYKPGIF8oDkpkHhcllJJc0SV68yKUojeLFfN+stef89+oco1NzJjlf/Zr9X9/ae6/5X9bZQFX/iVpIVyAq+lPy9vBqKXlFfpNesjlvD2gn+UY+kWPBq4guwAp8GA3XfPKRzIlGpaRZUYEfouHqJPtisJKqhxUoFgevhiwJsYprHgoFrg/elTAeEY1DocBdSXwjeZuMR1TvYQW2+Hg8eUfWZQnDqKPkO6xLlNRlWIHqc2o9OrXTcxmm0zHwB/Xg79uSWtzhGEzVBivwDblHduftQT2JgRKaDHve6mgUkQ7ikLl7YUk/yVMyKm8PHBbNrnJuktGJp1k9C+ujmn3lPYLl3k3ytCLK6yDNZJXHG0gfGevjotIvSHZQlgUv03byI8QukTF+3URe+vUZWP/MNIm8II1kJew9W907T275dUlNgN30LBqJnpNDyVizdD0ZH4Q9Y5r/zZZMz9bKZM3+OPJbRbkqekgdILUx6NIHgh5URzZ47DM5MpgBPCB3yDbyFYWZXQ67d42Pteza87PIQliutsxa98vSJhT2yTmP3Sen/HoP+UIWwV5+2+M6bFNhM5htnV9kB9kPK157egE56X5Zmgkr4ASZ6DG9sJtcJNdgHxXSFvKatMPyJRVzg7TC9qbaWtayHpOrZIaPy9Zc2H+aSktT7PtwBexgpJoNW1Ldk/6+q80U67lVVVXVP61+6493OQu0jY4AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAbCAYAAACjkdXHAAABAklEQVR4XmNgGFaAEYijgXgLEE8E4k4gvgbEc4FYHEkdBjAB4qMMEMV+SOJcQHwIiB8giaGAICD+C8QbgZgDTQ4E5IH4JwPEZRgAJHGVAWILLrANiH3QBVmB+D8Q26JLoIFZQNyOLADS+A6I45EFcYB1QLwaWcCdAWKrALIgDvACiFuQBaYxQDQTAuoMEHWgaISDy1BBQgAU3xguPAsVxAf4gfg9AxZ1S7AJooEiBoia++gSykD8GYjl0CWAQBGInwDxbyAOR5ODgzIg3gPE7GjioETzAYhd0cRRACjJfWeA+L8WivuAeCoQSyOpwwmUgDgCiIuBOA+IQ1ClR8EoIBEAAPAaL/7BPNDgAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAAAWCAYAAAChdVwBAAAE+klEQVR4Xu2ZeehtUxTHl5fhmfWEhMzTM2UIpfh5KZkyix4ihDInQ6a8DGXK9JJ4FI8Qf0jm4fcUIXMoQ/Qy84cMIV5ifX7r7PvbZ91z7tnnus71x/7Ut+5ee9979tl77bX23lckk8lkMsNzrjeMgf1Vh3tjx6yqusgbx8A23jAGdlFtoVrWVxSsUlHe1Nlitldt6I11LK/61hs7ZrbqV9UDvqJj7lb97Y0dw3y8740dsp7qQdWrqt9Vv6luLrUw/lA9rbpBdVNRvrzUwlhdbFznq+5UvSyDnXeKa1Tfe2PHvCbmDA/5ig7ZV6wP43ZK5mNcfVhB9bZqXlHGoZ4T64+PmGGsgs4sV0+xgeoj1YtFeR3Vm6qnQoMqdlZ9qfrOV3TMV2IvxgodB6SeT8QW57gcAsJ8jKsPbJ949lmRbX2xKHhCZIOFqofFot/Zri7wrOovsd+AS8R+/4NeC8etqhtVa0h6+l5b9bo3RpykeskbB8Dqe0t1mFhnU9M3KaMO3udAb2yASL20WJRIdYgnVYd6Y8SH0mIPJeX5SO3DqDlA9adqsbM/oVrkbHu7sucRsfc43VfUsbvqY9VM1ZrSLn2zH2DT6jlezGFX8xUDuExsxYUVmpq+rxNboTOcfZbqHWdrghS1ZfGZ76Y6xIpikeBYX6HsoNrWGxuI5yO1D/8F7CnpR4Ax/kH6AwFOybvfq1rg6oC9KO9xhOoW1RuqO8R+vxLy/G7F57ZOCTxgz6hMhJxUrRzZmthKLFXhSG2dEkgFpPvlijIR5hVpf4JnUQTaOCVwKHlMdV5kIwW/G5VT4Hfi+UjpA4viYrFxSFVVMGniELH+bOzsZJVnxNL6aap7xN4jwHfQItX5YlmRsVqs2qzXqoCjfrwShnFK2Ej1uepx1UqurgmuoFhhgWGcMnCF6gvVUb6iAa5/PpPpKAltnTLAeJLO2Rtv7eqaYD4IEoFUp+yCC8X6co6vqCA44XauHB+AlhLbY5beD2/11w3DOiUQlocZQJyZCBn4N07J4mDjjJO14Xbpv5Mc1imB790vNvCphPkIURL+L07JXnCJaq6vqIHDMv0makJwyv16LYyfC3sPQvGPYnuhoEmx01UokwZTuFTsgEC6GrThr4IIFfchHDC+LsqprCt2aiZakrpTIzb7SJ73gpT78VNh5/NevdbNzBFzLO7tcPZU6uYj9KHNfIwa+nVwVN4p+sw+cW5Uhk/F+s1cQHDKidCgIIxxD1bhhNOpYhvZUA57tEEQ1knb7GuAEzQDnMqE021iHeVOjHIKbJhx5n2K8hli+5cUxyRCTVSIxRkGci1JY45MH66WUd0ndhBLoW4+Qh9Q3XywsEJ/U3Xy1DebYS43d7ZHo8+T0n8LgxPzDA68QJCgHOYHyCJLCnst3M8RbvnBOJ0O4nqpTlF8n44e4ysSuEuso8+LXc00wQVs3en2RGmfynHSXWV68lI4SGwRVd02zBC7HWhLmA/6kDofo2RHsX9xvDMjDrMBxp4sFeDSnTYEhtj2XqEQvE6RsuP2MU/6H4yIQHVsorrKGyNINal3jYFJ6e9DE7O9wXGcNzTgn4+OLrXoZ4EMjspcobQ57Q4zH6PmWul/ftAeUTvgHMJper7qG5neS8Zw6OOGhYPolapfVFeXWmQyI4RsxJ6T655BC5jMd6TqAkn4zzuTyWQymUwmk8lkMpnMqPkHlGVFpSCXI0UAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAAA1ElEQVR4Xu3QvQ7BYBTG8TNZiI9IbGIVg9isEkazG7CIG5C4AJtB2CR2EYPZxgX4Gn1sZnEF/FHxOm1RK0/yS9+ekz5pK/JdAijrode0MNFDp1T1gMQxQls+KAljqYekjwQ6mKqdLV1xLqlY17cleezFXhI1zi9LgtiihIXa9ZCzDDFHyNhfU8AMPiTF/iZmBuLyY9fIWGe3khTGOOCI9PNapGGc3UpeJiu3z7jHc8nl4ZWaeS6JyeOv39WwMe6/SlE8volOBHXs4Fe7j9LEycE/v50zrzIqomHx6WoAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAAA6UlEQVR4Xu2TzQoBURiGPykpJVJcgI2lIrYKGywlN2Bja6HY23EDNi5CcRdCSvnZydrSivd05ujMN2dqji1PPc2Z7515OzPNENlRhwNYhCGWBWYIm3AJ1ywz0mfnUdh21gX40jIjCbjjQ40ZPPAhZ07mkgZcwDvMuiM3VXgjc4miBx98qIjDC+zALct0wuRTUoMbGIE58u5kTPKFCjLwqWUfTjDvrE0lKTiBXXiEK3csERcoTCWCEqw4Rw9lko+h8CvxRdy8ZzPrkjTJLeqKz/usnX9Fiyx3wknCEbzCGMsCMSX5Y3H//DZvu/0pn5T11FUAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAaCAYAAADv/O9kAAACjklEQVR4Xu2WS+hOURTFl/crKa88Jx4ppSQUBqQYUIQ8IgNCHpFMpJSBZEBCHqWUmDGgpLxGkhIlhJERoSiiGLKWfU/3nP3dj3vl/zdwfrXqO2fte7997t1n3wNkMv8lS6lbkTalNnpFXtCRJKLjGYD0/29QXZOIlKlI488lbsEIag61h/pOvaZ6xwFkFnUUdpO11LDU7nB6wnKcC8tRGhUHOK5TX2FxO6nBqZ1yAOVN1ztPjKb6+MlOZjL1BJbjbOfF7IfFfKP6Oq+FO9QV2AWPnCdW+ol/wGbqBCzHdc4LDKe2wmJuOq+FBdRVqgv1AnbRmSQCeObGv2IfdQh2P49K9CmsdJvyihoKy++C88QKajtsuypmZmq3cpDaXfzeArvoc2n/3NPvo/Hv0IJPwR6mR4te5CdrMAllJSq/u5En9EDU9LrB/I9U9ySignson04/6gPs4oCe5MVoXBc90LixjKTmR+MmqEmpwQrl9jbyxElqevFb/uXIq6Q/9YnqEc0dhl0cSvU0ta20G/GQGkiNo547rwlayLLit3KTlLuYQR0vfgt5u6JxJdqL+pR51Oj0+RpLvXFeE1SiejsPUKPDtkELixvubdjiFhfjJZE3EfYiq/pLwn3Yd9ozD3Zzvf3zzmvCS2oKtRqW8J+gF3MsGp+F5abyHx/Niw3UJTfXwhDqC9IyD+iJhZKq+q7XYSE1LRrrVOgPR3XQZymUudgLy0t73vcevaQdbq6FVbBO2I6w8DHeqMFytDYgoUU0OQhpe+ggosYYWIOyc2+M5oW2pbZXJToBhUUFVZ2/tf9V6k3RKdCXYIxKNN6X7XiMNEctSmf0QdQ7akIRd83FBXX20TqTyWQymUwm81f4AceDjhK8gG05AAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAaCAYAAADv/O9kAAACZ0lEQVR4Xu2WS8hOURSGX/dbMnDJfUBSShlIIZEyMREKkQEhl0gmIjPJgOSaUkrMGFBSbiNJGbmUTBWhKKIY8r7W2Z291zn/33e+8/9K9lNvfXu965xv7bOvQCbzX7KGehBpR2pjWOQFnUoy+p8xSP//HjUwyUiZjzT/SuIWTKaWUYeoX9Q7anicQBZTp2Ev2UxNTO1+ZyisxuWwGqWpcYLjLvUDlrefGpfaKcdQvnSr88Q0aoQPdsgiaroPdsE86iWsxqXOizkKy/lJjXRehUfULdgDz5wn1vtAA7Q0NvpgF+ykzsNq3OK8wCRqNyznvvMqrKRuUwOo17CHLiUZwCvXbsJZ9E3H31ITYPVdc55YR+2FLVflaKb1ynHqYPF7F+yhb6X9Z01/itpNOUdt8MGGzEU5E1Xf48gT+iDa9AbB/C/U4CSjhicov84o6jPs4YC+5PWo3RRNz7Yjrk1KG6xQbR8iT1ygFhS/5d+MvFpGU1+pIVHsJOxhTX1xkdpT2o3pi46rI2uL36pNUu1iIWw5BeQdiNq1nIAdZR5tdDq+ZlLvndcb/syX3lDPa+JSJ6hj8Yb7ENa5VUV7deTNgQ1kGLQeeQo7pz0rYC/X6F91XlPajrgG5kzUvgyrTdN/VhQX26gbLlZhPPUd6TQP6IuFKVV3rjehbcd1LIVpLo7A6tKa93uPBmmfi1XQTqudsCdCx2d4oyFtOq4LiC4iU6LYJpQ79/YoLrQsdQLUohtQ6FRQ3f1b619TvS3ddvwF0hrVKd3Rx1IfqdlF3h2XF/S3r9YVuu34P89haokPZjKZTCaTyXTKb7z6kYGYRlhfAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAAAlklEQVR4XmNgGAUDB5jRBdCADBDzoAvCQBkQL2bANEQbiG9AabygBIiXATErlK8DxBegNFGgHoi3AzE7EN8FYj1UacJgIhAfBGIrdAligBYQ/2LA9D9eIAnE54HYCcqfCsSTEdK4gTQQHwdiSzTxKQwQQxjRxFHAMSA2QhdkgGhawEDABSboAkgA5PcJQKyKLjEKBj0AAP17EWfWzkbSAAAAAElFTkSuQmCC>