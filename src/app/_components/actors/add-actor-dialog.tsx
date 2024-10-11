import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

export function AddActorDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [deployable, setDeployable] = useState(false);
  const [configurable, setConfigurable] = useState(false);
  const [migratable, setMigratable] = useState(false);
  const router = useRouter();

  const mutation = api.actors.create.useMutation({
    onSuccess: async () => {
      toast.success("Actor created successfully");
      router.refresh();
      setName("");
      setRole(undefined);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error: " + error.message, { duration: 0 });
    },
  });

  const isLoading = mutation.status === "pending";

  function onSubmit() {
    if (name && role) {
      mutation.mutate({ name, role: role as "agent" | "portal" | "service" | "user" | "other" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Actor</DialogTitle>
          <DialogDescription>Add a new actor to the system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Actor name"
            />
          </div>
          <div>
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
            <Label htmlFor="configurable" className="text-right">
              Configurable
            </Label>
            <Checkbox
              id="configurable"
              checked={configurable}
              disabled={migratable || deployable}
              onClick={() => setConfigurable(!configurable)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deployable" className="text-right">
              Deployable
            </Label>
            <Checkbox
              id="deployable"
              checked={deployable}
              disabled={migratable}
              onClick={() => {
                const newDeployable = !deployable;
                setDeployable(newDeployable);
                if (newDeployable) {
                  setConfigurable(true);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="migratable" className="text-right">
              Migratable
            </Label>
            <Checkbox
              id="migratable"
              checked={migratable}
              onClick={() => {
                const newMigratable = !migratable;
                setMigratable(newMigratable);
                if (newMigratable) {
                  setDeployable(true);
                  setConfigurable(true);
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={isLoading || !name || !role}>
            Add Actor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
