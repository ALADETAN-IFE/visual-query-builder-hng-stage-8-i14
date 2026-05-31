import { Schema } from "./types";

export const SCHEMAS: Schema[] = [
  {
    id: "users",
    label: "Users Data Source",
    description: "Database containing registered users, locations, ages, and registration dates",
    fields: [
      { id: "id", label: "ID", type: "number", placeholder: "e.g. 101" },
      { id: "name", label: "Full Name", type: "string", placeholder: "e.g. Chidi Benson" },
      { id: "age", label: "Age", type: "number", placeholder: "e.g. 21" },
      {
        id: "status",
        label: "Status",
        type: "enum",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "pending", label: "Pending" },
        ],
        defaultValue: "active",
      },
      { id: "country", label: "Country", type: "string", placeholder: "e.g. Nigeria" },
      { id: "createdAt", label: "Created Date", type: "date" },
    ],
  },
  {
    id: "products",
    label: "Inventory / Products",
    description: "Retail inventory items with pricing, category tags, stock status and ratings",
    fields: [
      { id: "id", label: "Product SKU", type: "string", placeholder: "e.g. SKU-9821" },
      { id: "title", label: "Product Title", type: "string", placeholder: "e.g. Leather Jacket" },
      { id: "price", label: "Price ($)", type: "number", placeholder: "e.g. 49.99" },
      {
        id: "category",
        label: "Category",
        type: "enum",
        options: [
          { value: "electronics", label: "Electronics" },
          { value: "clothing", label: "Clothing" },
          { value: "food", label: "Food & Beverage" },
          { value: "home", label: "Home Decor" },
        ],
        defaultValue: "electronics",
      },
      { id: "rating", label: "Rating (1-5)", type: "number", placeholder: "e.g. 4.5" },
      { id: "inStock", label: "In Stock Status", type: "boolean", defaultValue: true },
    ],
  },
  {
    id: "orders",
    label: "Sales & Orders",
    description: "Transaction history tracking customer orders, payments, amounts and ship dates",
    fields: [
      { id: "orderId", label: "Order #", type: "string", placeholder: "e.g. ORD-0032" },
      { id: "customerName", label: "Customer Name", type: "string", placeholder: "e.g. Amara Okafor" },
      { id: "totalAmount", label: "Total Amount ($)", type: "number", placeholder: "e.g. 150.00" },
      {
        id: "status",
        label: "Order Status",
        type: "enum",
        options: [
          { value: "paid", label: "Paid" },
          { value: "shipped", label: "Shipped" },
          { value: "pending", label: "Pending" },
          { value: "cancelled", label: "Cancelled" },
        ],
        defaultValue: "pending",
      },
      { id: "orderDate", label: "Order Date", type: "date" },
    ],
  },
];

export function getSchemaById(id: string): Schema | undefined {
  return SCHEMAS.find((s) => s.id === id);
}
