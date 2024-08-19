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

type Agent = {
  id: number;
  name: string;
};

export function EditAgentDialog({
  open,
  onOpenChange,
  agent,
}: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(agent?.name ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const mutation = api.agents.update.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
      toast.success("Agent updated successfully");
    },
    onError: (error) => {
      setErrorMessage("Failed to update agent: " + error.message);
    },
  });

  const loading = mutation.status === "pending";
  if (!agent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>Edit the agent&apos;s attribtues.</DialogDescription>
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
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!name}
            loading={loading}
            className="w-40"
            onClick={() => {
              mutation.mutate({ name, id: agent.id });
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
