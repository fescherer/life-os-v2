"use client";

import {
  createWarehouseBox,
  createWarehouseItem,
  deleteWarehouseBox,
  deleteWarehouseItem,
  renameWarehouseBox,
} from "@/modules/warehouse/actions";
import { Button } from "@/components/ui/button";
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
import { PageCoverBanner } from "@/components/page-cover-banner";
import { WarehouseEmptyState } from "@/modules/warehouse/components/warehouse-empty-state";
import { cn } from "@/lib/utils";
import { RowWithId } from "@/types/table";
import { WarehouseBox } from "@/modules/warehouse/types";
import { Box, Check, Home, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type WarehouseBoardProps = {
  boxes: RowWithId<WarehouseBox>[];
};

type SearchResult = {
  boxId: string;
  boxName: string;
  item: {
    id: string;
    text: string;
  };
};

const OVERVIEW_TAB_ID = "overview";

export function WarehouseBoard({ boxes }: WarehouseBoardProps) {
  const [activeTabId, setActiveTabId] = useState(OVERVIEW_TAB_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [renameBox, setRenameBox] = useState<RowWithId<WarehouseBox> | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [coverUrlValue, setCoverUrlValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeBox = boxes.find((boxItem) => boxItem.id === activeTabId);
  const totalItems = boxes.reduce(
    (total, boxItem) => total + boxItem.items.length,
    0,
  );

  const visibleItems = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const allItems = boxes.flatMap((boxItem) =>
      boxItem.items.map((item) => ({
        boxId: boxItem.id,
        boxName: boxItem.name,
        item,
      })),
    );

    if (!query) {
      return allItems;
    }

    return allItems.filter((result) =>
      result.item.text.toLowerCase().includes(query),
    );
  }, [boxes, searchQuery]);

  function handleCreateBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const boxId = await createWarehouseBox(formData);

        setActiveTabId(boxId);
        toast.success("Sheet added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add sheet.",
        );
      }
    });
  }

  function openRenameDialog(boxItem: RowWithId<WarehouseBox>) {
    setRenameBox(boxItem);
    setRenameValue(boxItem.name);
    setCoverUrlValue(boxItem.coverUrl ?? "");
  }

  function handleRenameBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renameBox) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("id", renameBox.id);

    startTransition(async () => {
      try {
        await renameWarehouseBox(formData);
        setRenameBox(null);
        setRenameValue("");
        setCoverUrlValue("");
        toast.success("Sheet renamed.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not rename sheet.",
        );
      }
    });
  }

  function handleDeleteBox(boxId: string) {
    startTransition(async () => {
      try {
        await deleteWarehouseBox(boxId);

        if (activeTabId === boxId) {
          setActiveTabId(OVERVIEW_TAB_ID);
        }

        toast.success("Sheet deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete sheet.",
        );
      }
    });
  }

  function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeBox) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("boxId", activeBox.id);

    startTransition(async () => {
      try {
        await createWarehouseItem(formData);
        setNewItemText("");
        toast.success("Item added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add item.",
        );
      }
    });
  }

  function handleDeleteItem(boxId: string, itemId: string) {
    startTransition(async () => {
      try {
        await deleteWarehouseItem(boxId, itemId);
        toast.success("Item deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete item.",
        );
      }
    });
  }

  return (
    <div className="border-border bg-card flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-md border">
      <div className="border-border bg-secondary/70 flex h-10 items-end gap-0 overflow-x-auto border-b px-3 pt-1">
        <button
          type="button"
          aria-label="Warehouse home"
          className={cn(
            "border-border flex h-8 shrink-0 items-center rounded-t-md border border-b-0 bg-background px-3 text-sm font-medium transition-colors hover:bg-card",
            activeTabId === OVERVIEW_TAB_ID
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "bg-background/70 text-muted-foreground",
          )}
          onClick={() => setActiveTabId(OVERVIEW_TAB_ID)}
        >
          <Home className="size-4" />
        </button>

        {boxes.map((boxItem) => (
          <DropdownMenu key={boxItem.id}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "border-border flex h-8 shrink-0 items-center rounded-t-md border border-b-0 bg-background px-3 text-sm font-medium transition-colors hover:bg-card",
                  activeTabId === boxItem.id
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "bg-background/70 text-muted-foreground",
                )}
                onClick={() => setActiveTabId(boxItem.id)}
              >
                <span className="max-w-40 truncate">{boxItem.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={() => setActiveTabId(boxItem.id)}>
                <Check className="size-4" />
                Open sheet
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openRenameDialog(boxItem)}>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleDeleteBox(boxItem.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        <form className="flex h-8 items-center" onSubmit={handleCreateBox}>
          <input type="hidden" name="name" value="" />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Add sheet"
            className="mb-1 rounded-md"
            disabled={isPending}
          >
            <Plus className="size-5" />
          </Button>
        </form>
      </div>

      <div className="border-border bg-background flex flex-col gap-3 border-b p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-5xl">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Search warehouse items"
            className="pl-9"
            placeholder="Search all warehouse sheets"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setActiveTabId(OVERVIEW_TAB_ID);
            }}
          />
        </div>

        <div className="flex shrink-0 gap-2">
          <div className="border-border bg-muted/50 flex h-9 items-center gap-2 rounded-md border px-3 text-xs">
            <span className="text-muted-foreground">Sheets</span>
            <span className="font-semibold">{boxes.length}</span>
          </div>
          <div className="border-border bg-muted/50 flex h-9 items-center gap-2 rounded-md border px-3 text-xs">
            <span className="text-muted-foreground">Items</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
        </div>
      </div>

      <div className="bg-background min-h-0 flex-1 overflow-auto">
        {activeTabId === OVERVIEW_TAB_ID ? (
          <div className="p-4">
            {visibleItems.length > 0 ? (
              <div className="border-border bg-card overflow-hidden rounded-md border">
                <div className="bg-muted text-muted-foreground grid grid-cols-[minmax(10rem,1fr)_14rem_3rem] text-xs font-medium">
                  <div className="border-border border-r px-3 py-2">Item</div>
                  <div className="border-border border-r px-3 py-2">Sheet</div>
                  <div className="px-3 py-2" />
                </div>
                {visibleItems.map((result) => (
                  <button
                    key={`${result.boxId}-${result.item.id}`}
                    type="button"
                    className="border-border hover:bg-muted/60 grid min-h-11 w-full grid-cols-[minmax(10rem,1fr)_14rem_3rem] border-t text-left transition-colors"
                    onClick={() => setActiveTabId(result.boxId)}
                  >
                    <span className="border-border min-w-0 border-r px-3 py-2 text-sm">
                      {result.item.text}
                    </span>
                    <span className="border-border text-muted-foreground min-w-0 truncate border-r px-3 py-2 text-sm">
                      {result.boxName}
                    </span>
                    <span className="grid place-items-center">
                      <Box className="text-muted-foreground size-4" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid min-h-[32rem] place-items-center text-center">
                <p className="text-base font-medium">
                  {searchQuery.trim()
                    ? "No item found"
                    : "Here goes the list of all items in all sheets"}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {activeBox ? (
          <div className="grid gap-4 p-4">
            <PageCoverBanner
              title={activeBox.name}
              coverUrl={activeBox.coverUrl}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">{activeBox.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {activeBox.items.length} item
                  {activeBox.items.length === 1 ? "" : "s"} stored here.
                </p>
              </div>
              <form className="flex gap-2" onSubmit={handleCreateItem}>
                <Input
                  aria-label={`Add item to ${activeBox.name}`}
                  className="w-64"
                  name="text"
                  placeholder="Item name"
                  value={newItemText}
                  onChange={(event) => setNewItemText(event.target.value)}
                />
                <Button type="submit" disabled={isPending}>
                  <Plus className="size-4" />
                  Item
                </Button>
              </form>
            </div>

            {activeBox.items.length > 0 ? (
              <div className="border-border bg-card overflow-hidden rounded-md border">
                <div className="bg-muted text-muted-foreground grid grid-cols-[3rem_minmax(12rem,1fr)_3rem] text-xs font-medium">
                  <div className="border-border border-r px-3 py-2">#</div>
                  <div className="border-border border-r px-3 py-2">Item</div>
                  <div className="px-3 py-2" />
                </div>
                {activeBox.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-border grid min-h-11 grid-cols-[3rem_minmax(12rem,1fr)_3rem] border-t"
                  >
                    <div className="bg-muted/40 border-border text-muted-foreground border-r px-3 py-2 text-sm">
                      {index + 1}
                    </div>
                    <p className="border-border min-w-0 border-r px-3 py-2 text-sm break-words">
                      {item.text}
                    </p>
                    <div className="grid place-items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${item.text}`}
                        disabled={isPending}
                        onClick={() => handleDeleteItem(activeBox.id, item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WarehouseEmptyState
                title="This sheet is empty"
                description="Add text items here so the home search can locate them later."
              />
            )}
          </div>
        ) : null}
      </div>

      <Dialog open={Boolean(renameBox)} onOpenChange={() => setRenameBox(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit sheet</DialogTitle>
            <DialogDescription>
              Update the sheet name and cover image.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleRenameBox}>
            <Input
              aria-label="Sheet name"
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
    </div>
  );
}
