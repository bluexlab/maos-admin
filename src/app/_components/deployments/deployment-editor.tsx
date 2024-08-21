"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { ConfigEditor } from "./config-editor";
import { ConfigViewer } from "./config-viewer";
import { PublishDeploymentAlert } from "./publish-deployment-alert";

// type DeploymentType = components["schemas"]["DeploymentDetail"];

export function DeploymentEditor({ deploymentId }: { deploymentId: number }) {
  const router = useRouter();
  const { data, refetch } = api.deployments.get.useQuery({ id: deploymentId });
  const deployment = data?.data;
  const agents = deployment?.configs?.sort((a, b) => a.agent_name.localeCompare(b.agent_name));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [openPublishDeploymentAlert, setOpenPublishDeploymentAlert] = useState(false);

  const publishMutation = api.deployments.publish.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Deployment published");
        router.push(`/deployments`);
        router.refresh();
      } else {
        toast.error("Failed to publish deployment: " + data.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const publishDeployment = () => {
    setOpenPublishDeploymentAlert(false);
    publishMutation.mutate({ id: deployment!.id });
  };

  const publishing = ["draft", "reviewing"].includes(deployment?.status ?? "unknown");

  return (
    <div className="flex flex-col">
      {agents?.map((agent, index) => (
        <div
          key={agent.id}
          className={cn(
            "flex flex-col py-4",
            index % 2 === 0 ? "bg-slate-900" : "",
            expanded === agent.agent_id
              ? "rounded-lg border border-gray-200 bg-slate-800"
              : "cursor-pointer",
          )}
          onClick={() => setExpanded(agent.agent_id)}
        >
          <div
            className={cn(
              "flex items-center justify-between",
              expanded === agent.agent_id && "font-bold",
            )}
          >
            <div className="flex-1 px-4">Agent {agent.agent_name}</div>
          </div>
          {expanded === agent.agent_id &&
            (publishing ? (
              <ConfigEditor config={agent} deploymentId={BigInt(deployment!.id)} onSave={refetch} />
            ) : (
              <ConfigViewer config={agent} />
            ))}
        </div>
      ))}

      {publishing && (
        <div className="mt-6 flex gap-4">
          <Button onClick={() => setOpenPublishDeploymentAlert(true)}>Publish</Button>
          <Button variant="danger" onClick={() => setOpenPublishDeploymentAlert(true)}>
            Remove
          </Button>
        </div>
      )}

      <PublishDeploymentAlert
        open={openPublishDeploymentAlert}
        onOpenChange={setOpenPublishDeploymentAlert}
        onSuccess={publishDeployment}
        deploymentName={deployment?.name ?? "Unknown"}
      />
    </div>
  );
}
