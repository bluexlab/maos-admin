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

export function AddDeploymentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { data: validName } = api.deployments.validName.useQuery({ name });
  const mutation = api.deployments.create.useMutation({
    onSuccess: (data) => {
      if (!data.data) {
        setErrorMessage("Failed to add deployment: " + data.error);
      } else {
        onOpenChange(false);
        router.refresh();
        toast.success("Deployment added successfully");
      }
    },
    onError: (error) => {
      setErrorMessage("Failed to add deployment: " + error.message);
    },
  });
  const loading = mutation.status === "pending";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Deployment</DialogTitle>
          <DialogDescription>Type the name of the deployment you want to add.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {errorMessage && <div className="flex justify-end text-red-500">{errorMessage}</div>}
          {validName?.data === false && (
            <div className="flex justify-end text-red-500">Deployment name already exists</div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!name || !validName?.data}
            loading={loading}
            className="w-40"
            onClick={() => {
              mutation.mutate({ name });
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
