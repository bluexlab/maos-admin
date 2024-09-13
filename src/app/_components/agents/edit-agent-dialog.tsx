import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
  renameable: boolean;
  deployable: boolean;
  configurable: boolean;
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
  const [deployable, setDeployable] = useState(agent?.deployable ?? false);
  const [configurable, setConfigurable] = useState(agent?.configurable ?? false);
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
          {agent.renameable && (
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
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deployable" className="text-right">
              Deployable
            </Label>
            <Checkbox
              id="deployable"
              checked={deployable}
              onClick={() => setDeployable(!deployable)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="configurable" className="text-right">
              Configurable
            </Label>
            <Checkbox
              id="configurable"
              checked={configurable}
              onClick={() => setConfigurable(!configurable)}
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
              mutation.mutate({
                id: agent.id,
                name: agent.renameable ? name : undefined,
                deployable: deployable,
                configurable: configurable,
              });
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
