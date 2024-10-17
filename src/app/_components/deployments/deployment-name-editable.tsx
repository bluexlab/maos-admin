"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function DeploymentNameEditable({
  deploymentId,
  initialName,
}: {
  deploymentId: number;
  initialName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const { mutate: updateDeployment, status } = api.deployments.update.useMutation();
  const isLoading = status === "pending";
  const handleSave = () => {
    updateDeployment({ id: deploymentId, name });
    setEditing(false);
    router.refresh();
  };

  return (
    <h1 className="flex w-[40rem] items-center gap-2 text-lg font-semibold text-gray-300">
      {editing ? (
        <div className="flex w-full items-center gap-2">
          <Input className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      ) : (
        <div>
          Deployment -<strong className="mx-1 text-white">{name}</strong>
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </h1>
  );
}
