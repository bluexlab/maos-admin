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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

type Actor = {
  id: number;
  name: string;
  role: string;
  renameable: boolean;
  deployable: boolean;
  configurable: boolean;
};

export function EditActorDialog({
  open,
  onOpenChange,
  actor,
}: {
  actor: Actor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(actor?.name ?? "");
  const [role, setRole] = useState<string>(actor?.role ?? "");
  const [deployable, setDeployable] = useState(actor?.deployable ?? false);
  const [configurable, setConfigurable] = useState(actor?.configurable ?? false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const mutation = api.actors.update.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
      toast.success("Actor updated successfully");
    },
    onError: (error) => {
      setErrorMessage("Failed to update actor: " + error.message);
    },
  });

  const loading = mutation.status === "pending";
  if (!actor) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Actor</DialogTitle>
          <DialogDescription>Edit the actor&apos;s attributes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {actor.renameable && (
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
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                id: actor.id,
                role: role as "user" | "agent" | "portal" | "service" | "other",
                name: actor.renameable ? name : undefined,
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
