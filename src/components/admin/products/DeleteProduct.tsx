import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react"; // Use Trash2Icon for consistency
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteProductProps {
  id: string;
}

export function DeleteProduct({ id }: DeleteProductProps) {
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleDelete = async () => {
    setIsLoading(true); // Set loading state to true before starting request
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success("Product deleted successfully.");
    } catch (error) {
      console.error("Failed to delete product: ", error);
      toast.error("Failed to delete product.");
    } finally {
      setIsLoading(false); // Reset loading state after request is complete
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="p-2 hover:bg-accent rounded-md">
        <Trash2Icon className="w-5 h-5" strokeWidth={1.5} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            The product is going to be permanently deleted. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
