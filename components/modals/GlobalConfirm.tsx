"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGlobal } from "@/context/GlobalContext";
import { Loader2 } from "lucide-react";

export default function GlobalConfirm() {
  const { confirmDialog, closeConfirm } = useGlobal();

  return (
    <AlertDialog open={confirmDialog.isOpen} onOpenChange={closeConfirm}>
      <AlertDialogContent className="rounded-lg p-8 bg-white dark:bg-neutral-900 border-none shadow-2xl">
        <AlertDialogHeader className="text-center items-center">
          <AlertDialogTitle className="text-2xl font-bold">{confirmDialog.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-500 mt-2">
            {confirmDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
          <AlertDialogCancel className="rounded-full h-12 flex-1" disabled={confirmDialog.loading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full h-12 flex-1 bg-black dark:bg-white text-white dark:text-black font-bold"
            disabled={confirmDialog.loading}
            onClick={(e) => {
              e.preventDefault();
              confirmDialog.onConfirm();
            }}
          >
            {confirmDialog.loading ? <Loader2 className="animate-spin" /> : "Lanjutkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}