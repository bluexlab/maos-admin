"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type LocalSettingsType } from "~/server/api/routers/setting";
import { api } from "~/trpc/react";

const SettingList = ({
  localSettings,
  availableSuites,
  hasApiToken,
  currentDeploymentApproveRequired,
}: {
  localSettings: LocalSettingsType;
  currentDeploymentApproveRequired: boolean;
  availableSuites: string[];
  hasApiToken: boolean;
}) => {
  const [apiToken, setApiToken] = useState("");
  const [deploymentApproveRequired, setDeploymentApproveRequired] = useState(
    currentDeploymentApproveRequired,
  );
  const [suggestDeploymentName, setSuggestDeploymentName] = useState(
    localSettings.suggestDeploymentName,
  );
  const [preferSuites, setPreferSuites] = useState(localSettings.preferSuites ?? availableSuites);
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
    mutation.mutate({
      apiToken,
      deploymentApproveRequired,
      suggestDeploymentName,
      preferSuites,
    });
  };

  const handleBootstrap = () => {
    mutateBootstrap.mutate();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col space-y-6">
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
              Prefer Suites
            </Label>
            <Card className="flex-1">
              <CardContent className="flex flex-col gap-4 p-4">
                {availableSuites.sort().map((suite) => (
                  <div key={suite} className="flex items-center gap-2">
                    <Checkbox
                      id={`preferSuite-${suite}`}
                      checked={preferSuites.includes(suite)}
                      onClick={() =>
                        setPreferSuites(
                          preferSuites.includes(suite)
                            ? preferSuites.filter((s) => s !== suite)
                            : [...preferSuites, suite],
                        )
                      }
                    />
                    <Label htmlFor={`preferSuite-${suite}`}>{suite}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-40" htmlFor="apiToken">
              API Token
            </Label>
            <div className="flex-1">
              <Input
                id="apiToken"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your API token"
              />
            </div>
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
