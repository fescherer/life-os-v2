"use client";

/* eslint-disable react/no-multi-comp */

import {
  createGogoCollection,
  createGogoCollectionItem,
  createGogoPurchase,
  deleteGogoCollection,
  deleteGogoCollectionItem,
  deleteGogoPurchase,
  renameGogoCollection,
  updateGogoCollectionItemQuantity,
  updateGogoPurchase,
} from "@/modules/gogo-toys/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GogoMetric } from "@/modules/gogo-toys/components/gogo-metric";
import { PageCoverBanner } from "@/components/page-cover-banner";
import { cn } from "@/lib/utils";
import { GogoCollection, GogoCollectionItem, GogoPurchase } from "@/modules/gogo-toys/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Home,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type GogoCollectionBoardProps = {
  collections: RowWithId<GogoCollection>[];
  purchases: RowWithId<GogoPurchase>[];
  selectOptions: SelectOption[];
};

const HOME_TAB_ID = "home";
const STORE_SELECT_ID = "store";
const GOGO_COLOR_TYPE_SELECT_ID = "gogo_color_type";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function PurchaseDatePicker({
  date,
  onDateChange,
}: {
  date?: Date;
  onDateChange: (date?: Date) => void;
}) {
  return (
    <div>
      <input
        name="date"
        type="hidden"
        value={date ? format(date, "yyyy-MM-dd") : ""}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            data-empty={!date}
            className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="size-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={onDateChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function GogoCollectionBoard({
  collections,
  purchases,
  selectOptions,
}: GogoCollectionBoardProps) {
  const [activeTabId, setActiveTabId] = useState(HOME_TAB_ID);
  const [renameCollection, setRenameCollection] =
    useState<RowWithId<GogoCollection> | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [coverUrlValue, setCoverUrlValue] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState<Date | undefined>();
  const [newPurchaseStore, setNewPurchaseStore] = useState("");
  const [purchaseEditTarget, setPurchaseEditTarget] =
    useState<RowWithId<GogoPurchase> | null>(null);
  const [purchaseEditDate, setPurchaseEditDate] = useState<Date | undefined>();
  const [purchaseEditStore, setPurchaseEditStore] = useState("");
  const [newItemColorType, setNewItemColorType] = useState("");
  const [deleteItemTarget, setDeleteItemTarget] =
    useState<GogoCollectionItem | null>(null);
  const [quantityEditTarget, setQuantityEditTarget] = useState<{
    collectionId: string;
    item: GogoCollectionItem;
  } | null>(null);
  const [quantityValue, setQuantityValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeCollection = collections.find(
    (collection) => collection.id === activeTabId,
  );
  const storeOptions = selectOptions.filter(
    (option) => option.select_identifier === STORE_SELECT_ID,
  );
  const colorTypeOptions = selectOptions.filter(
    (option) => option.select_identifier === GOGO_COLOR_TYPE_SELECT_ID,
  );
  const totalSpent = purchases.reduce(
    (total, purchase) => total + purchase.price,
    0,
  );
  const totalGogos = collections.reduce(
    (total, collection) =>
      total +
      collection.items.reduce(
        (collectionTotal, item) => collectionTotal + item.quantity,
        0,
      ),
    0,
  );
  const activeCollectionQuantity = useMemo(
    () =>
      activeCollection?.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ) ?? 0,
    [activeCollection],
  );

  function handleCreateCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const collectionId = await createGogoCollection(formData);

        setActiveTabId(collectionId);
        toast.success("Collection added.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not add collection.",
        );
      }
    });
  }

  function openRenameDialog(collection: RowWithId<GogoCollection>) {
    setRenameCollection(collection);
    setRenameValue(collection.name);
    setCoverUrlValue(collection.coverUrl ?? "");
  }

  function handleRenameCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renameCollection) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("id", renameCollection.id);

    startTransition(async () => {
      try {
        await renameGogoCollection(formData);
        setRenameCollection(null);
        setRenameValue("");
        setCoverUrlValue("");
        toast.success("Collection renamed.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not rename collection.",
        );
      }
    });
  }

  function handleDeleteCollection(collectionId: string) {
    startTransition(async () => {
      try {
        await deleteGogoCollection(collectionId);

        if (activeTabId === collectionId) {
          setActiveTabId(HOME_TAB_ID);
        }

        toast.success("Collection deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not delete collection.",
        );
      }
    });
  }

  function handleCreatePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createGogoPurchase(formData);
        form.reset();
        setNewPurchaseDate(undefined);
        setNewPurchaseStore("");
        toast.success("Purchase added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add purchase.",
        );
      }
    });
  }

  function handleDeletePurchase(purchaseId: string) {
    startTransition(async () => {
      try {
        await deleteGogoPurchase(purchaseId);
        toast.success("Purchase deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not delete purchase.",
        );
      }
    });
  }

  function openPurchaseEditor(purchase: RowWithId<GogoPurchase>) {
    setPurchaseEditTarget(purchase);
    setPurchaseEditDate(getDate(purchase.date));
    setPurchaseEditStore(purchase.store);
  }

  function handleUpdatePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!purchaseEditTarget) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("id", purchaseEditTarget.id);

    startTransition(async () => {
      try {
        await updateGogoPurchase(formData);
        setPurchaseEditTarget(null);
        setPurchaseEditDate(undefined);
        setPurchaseEditStore("");
        toast.success("Purchase updated.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not update purchase.",
        );
      }
    });
  }

  function handleCreateCollectionItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeCollection) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("collectionId", activeCollection.id);

    startTransition(async () => {
      try {
        await createGogoCollectionItem(formData);
        form.reset();
        setNewItemColorType("");
        toast.success("Gogo row added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add Gogo row.",
        );
      }
    });
  }

  function handleUpdateQuantity(
    collectionId: string,
    itemId: string,
    quantity: number,
  ) {
    startTransition(async () => {
      try {
        await updateGogoCollectionItemQuantity(collectionId, itemId, quantity);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update quantity.",
        );
      }
    });
  }

  function openQuantityEditor(collectionId: string, item: GogoCollectionItem) {
    setQuantityEditTarget({ collectionId, item });
    setQuantityValue(String(item.quantity));
  }

  function handleQuantityEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quantityEditTarget) {
      return;
    }

    const quantity = Number(quantityValue);

    if (!Number.isFinite(quantity)) {
      toast.error("Use a valid quantity.");
      return;
    }

    if (quantity !== quantityEditTarget.item.quantity) {
      handleUpdateQuantity(
        quantityEditTarget.collectionId,
        quantityEditTarget.item.id,
        quantity,
      );
    }

    setQuantityEditTarget(null);
  }

  function handleDeleteCollectionItem(collectionId: string, itemId: string) {
    startTransition(async () => {
      try {
        await deleteGogoCollectionItem(collectionId, itemId);
        toast.success("Gogo row deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete Gogo row.",
        );
      }
    });
  }

  return (
    <div className="border-border bg-card flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-md border">
      <div className="border-border bg-secondary/70 flex h-10 items-end gap-0 overflow-x-auto border-b px-3 pt-1">
        <button
          type="button"
          aria-label="Gogo home"
          className={cn(
            "border-border flex h-8 shrink-0 items-center rounded-t-md border border-b-0 bg-background px-3 text-sm font-medium transition-colors hover:bg-card",
            activeTabId === HOME_TAB_ID
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "bg-background/70 text-muted-foreground",
          )}
          onClick={() => setActiveTabId(HOME_TAB_ID)}
        >
          <Home className="size-4" />
        </button>

        {collections.map((collection) => (
          <DropdownMenu key={collection.id}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "border-border flex h-8 shrink-0 items-center rounded-t-md border border-b-0 bg-background px-3 text-sm font-medium transition-colors hover:bg-card",
                  activeTabId === collection.id
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "bg-background/70 text-muted-foreground",
                )}
                onClick={() => setActiveTabId(collection.id)}
              >
                <span className="max-w-40 truncate">{collection.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onSelect={() => setActiveTabId(collection.id)}>
                <Check className="size-4" />
                Open collection
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openRenameDialog(collection)}>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleDeleteCollection(collection.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        <form className="flex h-8 items-center" onSubmit={handleCreateCollection}>
          <input type="hidden" name="name" value="" />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Add collection"
            className="mb-1 rounded-md"
            disabled={isPending}
          >
            <Plus className="size-5" />
          </Button>
        </form>
      </div>

      <div className="bg-background min-h-0 flex-1 overflow-auto">
        {activeTabId === HOME_TAB_ID ? (
          <div className="grid gap-4 p-4">
            <section className="grid gap-3 md:grid-cols-4">
              <GogoMetric
                label="Collections"
                value={collections.length.toString()}
              />
              <GogoMetric label="Total Gogos" value={totalGogos.toString()} />
              <GogoMetric label="Purchases" value={purchases.length.toString()} />
              <GogoMetric label="Total price" value={formatCurrency(totalSpent)} />
            </section>

            <form
              className="border-border bg-card grid gap-3 rounded-md border p-3 xl:grid-cols-[10rem_1fr_8rem_12rem_auto]"
              onSubmit={handleCreatePurchase}
            >
              <PurchaseDatePicker
                date={newPurchaseDate}
                onDateChange={setNewPurchaseDate}
              />
              <Input
                name="description"
                aria-label="Purchase description"
                placeholder="Description"
                required
              />
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                aria-label="Purchase price"
                placeholder="Price"
                required
              />
              <Select
                name="store"
                value={newPurchaseStore}
                onValueChange={setNewPurchaseStore}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isPending}>
                <Plus className="size-4" />
                Add
              </Button>
            </form>

            <section className="border-border bg-card overflow-hidden rounded-md border">
              <div className="bg-muted text-muted-foreground grid grid-cols-[8rem_minmax(12rem,1fr)_8rem_12rem_5rem] text-xs font-medium">
                <div className="border-border border-r px-3 py-2">Date</div>
                <div className="border-border border-r px-3 py-2">
                  Description
                </div>
                <div className="border-border border-r px-3 py-2">Price</div>
                <div className="border-border border-r px-3 py-2">Store</div>
                <div className="px-3 py-2" />
              </div>
              {purchases.length > 0 ? (
                purchases.map((purchase) => {
                  const store = storeOptions.find(
                    (option) => option.value === purchase.store,
                  );

                  return (
                    <div
                      key={purchase.id}
                      className="border-border grid min-h-11 grid-cols-[8rem_minmax(12rem,1fr)_8rem_12rem_5rem] border-t"
                    >
                      <div className="border-border border-r px-3 py-2 text-sm">
                        {formatDate(purchase.date)}
                      </div>
                      <div className="border-border min-w-0 border-r px-3 py-2 text-sm">
                        {purchase.description}
                      </div>
                      <div className="border-border border-r px-3 py-2 text-sm font-medium">
                        {formatCurrency(purchase.price)}
                      </div>
                      <div className="border-border border-r px-3 py-2 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{
                              backgroundColor: store?.color ?? "#71717a",
                            }}
                          />
                          {purchase.store}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${purchase.description}`}
                          disabled={isPending}
                          onClick={() => openPurchaseEditor(purchase)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${purchase.description}`}
                          disabled={isPending}
                          onClick={() => handleDeletePurchase(purchase.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-muted-foreground px-4 py-12 text-center text-sm">
                  No purchases yet.
                </div>
              )}
            </section>
          </div>
        ) : null}

        {activeCollection ? (
          <div className="grid gap-4 p-4">
            <PageCoverBanner
              title={activeCollection.name}
              coverUrl={activeCollection.coverUrl}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">
                  {activeCollection.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Total quantity:{" "}
                  <span className="text-foreground font-semibold">
                    {activeCollectionQuantity}
                  </span>
                </p>
              </div>
            </div>

            <form
              className="border-border bg-card grid gap-3 rounded-md border p-3 xl:grid-cols-[10rem_1fr_1fr_12rem_8rem_auto]"
              onSubmit={handleCreateCollectionItem}
            >
              <Input
                name="color"
                type="color"
                aria-label="Color background"
                defaultValue="#71717a"
              />
              <Input
                name="colorText"
                aria-label="Color text"
                placeholder="Color text"
                required
              />
              <Input
                name="imageUrl"
                type="url"
                aria-label="Cover image URL"
                placeholder="Cover image URL"
              />
              <Select
                name="colorType"
                value={newItemColorType}
                onValueChange={setNewItemColorType}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Color type" />
                </SelectTrigger>
                <SelectContent>
                  {colorTypeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="quantity"
                type="number"
                min="0"
                step="1"
                aria-label="Quantity"
                placeholder="Quantity"
                required
              />
              <Button type="submit" disabled={isPending}>
                <Plus className="size-4" />
                Add
              </Button>
            </form>

            {activeCollection.items.length > 0 ? (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {activeCollection.items.map((item) => {
                  const colorType = colorTypeOptions.find(
                    (option) => option.value === item.colorType,
                  );

                  return (
                    <article
                      key={item.id}
                      className="group border-border bg-card overflow-hidden rounded-md border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      onDoubleClick={() =>
                        openQuantityEditor(activeCollection.id, item)
                      }
                    >
                      <div
                        className="bg-muted relative aspect-[4/5] overflow-hidden"
                        style={
                          item.imageUrl
                            ? undefined
                            : { backgroundColor: item.color }
                        }
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute top-3 right-3 z-10 bg-black/35 text-white hover:bg-black/55 hover:text-white"
                          aria-label={`Delete ${item.colorText}`}
                          disabled={isPending}
                          onClick={() => setDeleteItemTarget(item)}
                          onDoubleClick={(event) => event.stopPropagation()}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <div className="absolute top-3 left-3 z-10 grid size-14 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm">
                          <div className="text-center">
                            <p className="text-[10px] leading-none font-medium uppercase opacity-75">
                              Qty
                            </p>
                            <p className="mt-0.5 text-lg leading-none font-semibold">
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                        {item.imageUrl ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundImage: `url(${JSON.stringify(
                                item.imageUrl,
                              )})`,
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_34%),linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.16),transparent)] transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-x-0 bottom-0 grid gap-3 p-4 text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full border border-white/60"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="line-clamp-2 text-xl leading-tight font-semibold">
                              {item.colorText}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-md bg-white/16 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                              {item.color}
                            </span>
                            <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/16 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    colorType?.color ?? "#71717a",
                                }}
                              />
                              <span className="truncate">{item.colorType}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <div className="border-border text-muted-foreground rounded-md border border-dashed px-4 py-12 text-center text-sm">
                No Gogo colors in this collection yet.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(renameCollection)}
        onOpenChange={() => setRenameCollection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the collection name and cover image.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleRenameCollection}>
            <Input
              aria-label="Collection name"
              name="name"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              autoFocus
            />
            <Input
              aria-label="Cover image URL"
              name="coverUrl"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={coverUrlValue}
              onChange={(event) => setCoverUrlValue(event.target.value)}
            />
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(quantityEditTarget)}
        onOpenChange={() => setQuantityEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit quantity</DialogTitle>
            <DialogDescription>
              Update the quantity for{" "}
              {quantityEditTarget?.item.colorText ?? "this item"}.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleQuantityEdit}>
            <Input
              name="quantity"
              type="number"
              min="0"
              step="1"
              aria-label="Quantity"
              value={quantityValue}
              onChange={(event) => setQuantityValue(event.target.value)}
              autoFocus
            />
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(purchaseEditTarget)}
        onOpenChange={() => {
          setPurchaseEditTarget(null);
          setPurchaseEditDate(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit purchase</DialogTitle>
            <DialogDescription>
              Update the saved date, description, price, or store.
            </DialogDescription>
          </DialogHeader>
          {purchaseEditTarget ? (
            <form className="grid gap-4" onSubmit={handleUpdatePurchase}>
              <PurchaseDatePicker
                date={purchaseEditDate}
                onDateChange={setPurchaseEditDate}
              />
              <Input
                name="description"
                aria-label="Purchase description"
                defaultValue={purchaseEditTarget.description}
                required
              />
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                aria-label="Purchase price"
                defaultValue={purchaseEditTarget.price}
                required
              />
              <Select
                name="store"
                value={purchaseEditStore}
                onValueChange={setPurchaseEditStore}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter showCloseButton>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteItemTarget)}
        onOpenChange={() => setDeleteItemTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gogo item?</DialogTitle>
            <DialogDescription>
              This will remove {deleteItemTarget?.colorText ?? "this item"} from
              the collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending || !activeCollection || !deleteItemTarget}
              onClick={() => {
                if (!activeCollection || !deleteItemTarget) {
                  return;
                }

                handleDeleteCollectionItem(
                  activeCollection.id,
                  deleteItemTarget.id,
                );
                setDeleteItemTarget(null);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
