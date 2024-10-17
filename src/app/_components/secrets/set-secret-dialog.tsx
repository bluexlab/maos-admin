import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export function SetSecretDialog({
  secretName,
  secretKey,
  open,
  onOpenChange,
}: {
  secretName: string;
  secretKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState<string>("");
  const router = useRouter();
  const mutation = api.secrets.updateKey.useMutation({
    onSuccess: () => {
      toast.success("Key updated");
      handleOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 0 });
    },
  });

  const handleOpenChange = (open: boolean) => {
    setValue("");
    onOpenChange(open);
  };

  const loading = mutation.status === "pending";
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Secret</DialogTitle>
          <DialogDescription>
            Set the value of the secret <span className="font-bold">{secretName}</span> with key{" "}
            <span className="font-bold">{secretKey}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              type="password"
              className="col-span-3"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              disabled={loading}
              className="w-40"
              onClick={() => {
                handleOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!value}
              loading={loading}
              className="w-40"
              onClick={() => {
                mutation.mutate({ name: secretName, key: secretKey, value });
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
