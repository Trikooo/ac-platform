import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { CartItem } from "@/types/types";
import { useEffect } from "react";

type CartItemsCardProps = {
  cartItems: CartItem[];
  loadingItemId: string | null; // Add loadingItemId prop
  deleteLoadingItemId: string | null;
  className?: string;
  onUpdateQuantity: (
    id: string,
    newQuantity: number,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onRemoveItem: (id: string) => void;
};

export default function CartItemsCard({
  cartItems,
  loadingItemId,
  deleteLoadingItemId,
  className,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemsCardProps) {
  if (!cartItems || cartItems.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
    );
  }

  return (
    <div className={`py-8 ${className}`}>
      <div className="space-y-8">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 pb-6 border-b">
            <Image
              src={item.product.imageUrls[0]}
              alt={item.product.name}
              width={80}
              height={80}
              className="rounded-md object-cover"
              style={{ aspectRatio: "1", objectFit: "cover" }}
            />
            <div className="flex-grow">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-gray-600">{item.price} DA</p>
              <div className="flex items-center mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
                  }
                  aria-label={`Decrease quantity of ${item.product.name}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value, 10);
                    onUpdateQuantity(item.id, newQuantity, e);
                  }}
                  onBlur={(e) => {
                    let newQuantity = parseInt(e.target.value, 10);
                    if (newQuantity === 0 || isNaN(newQuantity)) {
                      newQuantity = 1;
                    }
                    onUpdateQuantity(item.id, newQuantity);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      let newQuantity = parseInt(e.currentTarget.value, 10);
                      if (newQuantity === 0 || isNaN(newQuantity)) {
                        newQuantity = 1;
                      }
                      onUpdateQuantity(item.id, newQuantity);
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-16 mx-2 text-center"
                  aria-label={`Quantity of ${item.product.name}`}
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.product.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* Conditionally render loader next to the Plus button */}
                {loadingItemId === item.id && (
                  <Loader2
                    className="w-4 h-4 ml-2 animate-spin"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.id)}
              aria-label={`Remove ${item.product.name} from cart`}
              className="text-muted-foreground hover:text-destructive"
            >
              {deleteLoadingItemId === item.id ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Trash2 className="h-5 w-5" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}


