import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/auth.store";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../api";
import { productSchema, type Product, type ProductInput } from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterBar } from "@/components/shared/FilterBar";
import { ProductFormFields } from "../components/ProductFormFields";
import { formatCurrency } from "@/lib/formatters";
import { Plus, Edit2, Trash2, Tag, AlertTriangle } from "lucide-react";

export const ProductsPage: React.FC = () => {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();

  // URL state persistence
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "all";
  const sort = searchParams.get("sort") || "name:asc";

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next, { replace: true });
  };

  // Queries & Mutations
  const { data, isLoading } = useProducts({
    page,
    pageSize,
    search,
    type: type === "all" ? undefined : type,
    sort,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Dialog State
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: ProductInput) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteMutation.mutateAsync({
      id: deleteConfirm.id,
      name: deleteConfirm.name,
    });
    setDeleteConfirm(null);
  };

  // Columns definition
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.original.name}
          </div>
          {row.original.notes && (
            <div className="text-xs text-muted-foreground truncate max-w-xs">
              {row.original.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize ${
            row.original.type === "service"
              ? "bg-sky-100 text-sky-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "salesPrice",
      header: "Sales Price",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(row.original.salesPrice)}
        </span>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.costPrice)}
        </span>
      ),
    },
    {
      accessorKey: "variants",
      header: "Variants",
      cell: ({ row }) => {
        const count = row.original.variants?.length || 0;
        if (count === 0) {
          return <span className="text-xs text-muted-foreground">Standard</span>;
        }
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-foreground text-xs font-medium">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {count} {count === 1 ? "variant" : "variants"}
            </span>
          </div>
        );
      },
    },
    ...(isAdmin
      ? ([
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: Product } }) => (
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => handleOpenEdit(row.original)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(row.original)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ] as ColumnDef<Product>[])
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products & Catalog"
        description="Configure goods, subscription service items, base prices, and brand variants."
        actions={
          isAdmin ? (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => updateParams({ search: val, page: 1 })}
        searchPlaceholder="Search product by name, notes, or variant..."
        filters={[
          {
            key: "type",
            label: "Product Type",
            value: type,
            options: [
              { label: "All Types", value: "all" },
              { label: "Services", value: "service" },
              { label: "Goods / Hardware", value: "goods" },
            ],
            onChange: (val) => updateParams({ type: val, page: 1 }),
          },
        ]}
      />

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        isLoading={isLoading}
        pagination={{ page, pageSize }}
        onPaginationChange={(p: PaginationState) =>
          updateParams({ page: p.page, pageSize: p.pageSize })
        }
        emptyMessage="No products match your search criteria."
      />

      {/* Create / Edit FormDialog */}
      {isAdmin && (
        <FormDialog<ProductInput>
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingProduct ? "Edit Product" : "Create New Product"}
          description={
            editingProduct
              ? `Update pricing and variants for "${editingProduct.name}"`
              : "Set up a product with sales and cost price, plus optional brand variants"
          }
          schema={productSchema}
          defaultValues={
            editingProduct
              ? {
                  name: editingProduct.name,
                  type: editingProduct.type,
                  salesPrice: editingProduct.salesPrice,
                  costPrice: editingProduct.costPrice,
                  notes: editingProduct.notes || "",
                  variants: editingProduct.variants || [],
                }
              : {
                  name: "",
                  type: "service",
                  salesPrice: 0,
                  costPrice: 0,
                  notes: "",
                  variants: [],
                }
          }
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          submitLabel={editingProduct ? "Save Changes" : "Create Product"}
        >
          {(form) => (
            <ProductFormFields
              register={form.register}
              control={form.control}
              watch={form.watch}
              errors={form.formState.errors}
            />
          )}
        </FormDialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Delete Product?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-foreground">{deleteConfirm.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

