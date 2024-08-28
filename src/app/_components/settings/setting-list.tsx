"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

type SettingsType = {
  deploymentApproveRequired?: boolean | undefined;
};

const SettingList = ({ settings }: { settings: SettingsType }) => {
  const [apiToken, setApiToken] = useState("");
  const [deploymentApproveRequired, setDeploymentApproveRequired] = useState(
    settings.deploymentApproveRequired,
  );

  const router = useRouter();
  const mutation = api.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings updated");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      apiToken,
      deploymentApproveRequired,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="my-2 flex items-center gap-2">
            <Checkbox
              id="approveDeployment"
              checked={deploymentApproveRequired}
              onClick={() => setDeploymentApproveRequired(!deploymentApproveRequired)}
            />
            <Label htmlFor="approveDeployment">Deployment require approval</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-40" htmlFor="apiToken">
              API Token
            </Label>
            <Input
              id="apiToken"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your API token"
            />
          </div>
        </div>
        <Button type="submit" className="w-40" loading={mutation.status === "pending"}>
          Update
        </Button>
      </form>
    </div>
  );
};

export default SettingList;
