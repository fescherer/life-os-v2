import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Coin } from "@/types/coin";

type CoinFormFieldsProps = {
  coin?: Coin;
};

export function CoinFormFields({ coin }: CoinFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="1 real"
          defaultValue={coin?.name}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="year">
            Year
          </label>
          <Input
            id="year"
            name="year"
            placeholder="1993-1995"
            defaultValue={coin?.year}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="family">
            Family
          </label>
          <Input
            id="family"
            name="family"
            placeholder="Real"
            defaultValue={coin?.family}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="material">
          Material
        </label>
        <Input
          id="material"
          name="material"
          placeholder="Stainless steel"
          defaultValue={coin?.material}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="60 anos real"
          defaultValue={coin?.description}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="numistaId">
            Numista id
          </label>
          <Input
            id="numistaId"
            name="numistaId"
            placeholder="12345"
            defaultValue={coin?.numistaId}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">
            Image URL
          </label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            defaultValue={coin?.imageUrl}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            name="isCommemorative"
            type="checkbox"
            defaultChecked={coin?.isCommemorative}
            className="border-input size-4 rounded border"
          />
          Commemorative
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            name="isOwned"
            type="checkbox"
            defaultChecked={coin?.isOwned}
            className="border-input size-4 rounded border"
          />
          In collection
        </label>
      </div>
    </div>
  );
}
