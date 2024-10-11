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
  suggestDeploymentName?: boolean | undefined;
};

const SettingList = ({
  settings,
  hasApiToken,
}: {
  settings: SettingsType;
  hasApiToken: boolean;
}) => {
  const [apiToken, setApiToken] = useState("");
  const [deploymentApproveRequired, setDeploymentApproveRequired] = useState(
    settings.deploymentApproveRequired,
  );
  const [suggestDeploymentName, setSuggestDeploymentName] = useState(
    settings.suggestDeploymentName ?? false,
  );

  const router = useRouter();
  const mutation = api.settings.update.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Settings updated");
        router.refresh();
      } else {
        toast.error("Failed to update settings: " + data.error, { duration: 0 });
      }
    },
    onError: () => {
      toast.error("Failed to update settings", { duration: 0 });
    },
  });

  const mutateBootstrap = api.settings.bootstrap.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Bootstrap successful");
        router.refresh();
      } else {
        toast.error("Failed to bootstrap: " + data.error, { duration: 0 });
      }
    },
    onError: (e) => {
      toast.error(`Failed to bootstrap: ${e.message}`, { duration: 0 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("suggestDeploymentName", suggestDeploymentName);
    mutation.mutate({
      apiToken,
      deploymentApproveRequired,
      suggestDeploymentName,
    });
  };

  const handleBootstrap = () => {
    mutateBootstrap.mutate();
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

          <div className="my-2 flex items-center gap-2">
            <Checkbox
              id="suggestDeploymentName"
              checked={suggestDeploymentName}
              onClick={() => setSuggestDeploymentName(!suggestDeploymentName)}
            />
            <Label htmlFor="suggestDeploymentName">Suggest deployment name</Label>
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
        <div className="flex items-center justify-start gap-4">
          <Button type="submit" className="w-40" loading={mutation.status === "pending"}>
            Update
          </Button>
          {!hasApiToken && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleBootstrap}
              loading={mutateBootstrap.status === "pending"}
            >
              Bootstrap
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingList;
