"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

const allPermissions = [
  "read:invocation",
  "create:invocation",
  "read:completion",
  "create:completion",
  "admin",
];

type Token = {
  id: string;
  created_at: number;
  created_by: string;
  expire_at: number | null;
  permissions: string[];
};

type ActorTokenListProps = {
  tokens: Token[];
  actorId: number;
};

const ActorTokenList = ({ tokens, actorId }: ActorTokenListProps) => {
  const [showFullId, setShowFullId] = useState<string | null>(null);
  const [tokenToRemove, setTokenToRemove] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expireDays, setExpireDays] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const router = useRouter();

  const toggleShowFullId = (id: string) => {
    setShowFullId(showFullId === id ? null : id);
  };

  const removeTokenMutation = api.actors.removeToken.useMutation({
    onSuccess: () => {
      toast.success("Token removed successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to remove token: ${error.message}`, { duration: 0 });
    },
  });

  const createTokenMutation = api.actors.createToken.useMutation({
    onSuccess: () => {
      toast.success("Token created successfully");
      setIsCreateDialogOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to create token: ${error.message}`, { duration: 0 });
    },
  });

  const handleRemoveToken = () => {
    if (tokenToRemove) {
      removeTokenMutation.mutate({ id: tokenToRemove });
      setTokenToRemove(null);
    }
  };

  const handleCreateToken = () => {
    const expireAt = expireDays ? Date.now() + parseInt(expireDays) * 24 * 60 * 60 * 1000 : 0;
    createTokenMutation.mutate({
      actorId: actorId,
      expire_at: Math.floor(expireAt / 1000),
      permissions: permissions,
    });
  };

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Token ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell>
                {showFullId === token.id ? token.id : token.id.toString().slice(0, 10) + "..."}
              </TableCell>
              <TableCell>{new Date(token.created_at * 1000).toLocaleString()}</TableCell>
              <TableCell>
                {token.expire_at ? new Date(token.expire_at * 1000).toLocaleString() : "Never"}
              </TableCell>
              <TableCell>{token.created_by}</TableCell>
              <TableCell>{token.permissions.join(", ")}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => toggleShowFullId(token.id)}>
                    {showFullId === token.id ? "Hide" : "Show"} Full ID
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTokenToRemove(token.id)}
                  >
                    Remove
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button className="w-64" onClick={() => setIsCreateDialogOpen(true)}>
        Create New Token
      </Button>

      <AlertDialog open={!!tokenToRemove} onOpenChange={() => setTokenToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove this token?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The token will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveToken}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Token</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expireDays" className="text-right">
                Expire in (days)
              </Label>
              <Input
                id="expireDays"
                type="number"
                value={expireDays}
                onChange={(e) => setExpireDays(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Permissions</Label>
              <div className="col-span-3 flex flex-col gap-2">
                {allPermissions.map((permission) => (
                  <div key={permission} className="flex items-center gap-2">
                    <Checkbox
                      id={permission}
                      checked={permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label
                      htmlFor={permission}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateToken}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActorTokenList;
