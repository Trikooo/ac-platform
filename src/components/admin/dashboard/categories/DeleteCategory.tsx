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
import { Button } from "@/components/ui/button";
import { TrashIcon, Loader2 } from "lucide-react"; // Import a loading icon
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteCategoryProps {
  id: string;
}

export function DeleteCategory({ id }: DeleteCategoryProps) {
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleDelete = async () => {
    setIsLoading(true); // Set loading state to true before starting request
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Failed to delete category: ", error);
      toast.error("Failed to delete category.");
    } finally {
      setIsLoading(false); // Reset loading state after request is complete
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" isLoading={isLoading}>
          <TrashIcon className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            The category is going to be permanently deleted. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {" "}
            {/* Disable action button when loading */}
            {isLoading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
