import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  variant?: "info" | "warning";
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "OK",
  variant = "info"
}: AlertDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              variant === "warning" ? "bg-yellow-100" : "bg-blue-100"
            }`}>
              {variant === "warning" ? (
                <AlertTriangle className={`h-5 w-5 ${variant === "warning" ? "text-yellow-600" : "text-blue-600"}`} />
              ) : (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end">
          <Button onClick={onClose} className="min-w-[80px]">
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
