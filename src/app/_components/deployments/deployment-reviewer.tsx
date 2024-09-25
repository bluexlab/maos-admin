"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { ConfigViewer } from "./config-viewer";
import { PublishDeploymentAlert, RejectDeploymentAlert } from "./alerts";

export default function DeploymentReviewer({ deploymentId }: { deploymentId: number }) {
  const router = useRouter();
  const { data, isLoading } = api.deployments.get.useQuery({ id: deploymentId });
  const deployment = data?.data;
  const actors = deployment?.configs?.sort((a, b) => a.actor_name.localeCompare(b.actor_name));
  const [openPublishDeploymentAlert, setOpenPublishDeploymentAlert] = useState(false);
  const [openRejectDeploymentAlert, setOpenRejectDeploymentAlert] = useState(false);

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

  const rejectMutation = api.deployments.reject.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Deployment rejected");
        router.push(`/deployments`);
        router.refresh();
      } else {
        toast.error("Failed to reject deployment: " + data.error);
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

  const rejectDeployment = (reason: string) => {
    setOpenRejectDeploymentAlert(false);
    rejectMutation.mutate({ id: deployment!.id, reason });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Actors Config</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSection />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {actors?.map((actor) => (
                <AccordionItem key={actor.actor_id} value={`item-${actor.actor_id}`}>
                  <AccordionTrigger className="px-4 data-[state=open]:bg-slate-800">
                    Actor {actor.actor_name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ConfigViewer config={actor} references={[]} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button onClick={() => setOpenPublishDeploymentAlert(true)}>Publish</Button>
        <Button variant="danger" onClick={() => setOpenRejectDeploymentAlert(true)}>
          Reject
        </Button>
      </div>

      <PublishDeploymentAlert
        open={openPublishDeploymentAlert}
        onOpenChange={setOpenPublishDeploymentAlert}
        onSuccess={publishDeployment}
        deploymentName={deployment?.name ?? "Unknown"}
      />

      <RejectDeploymentAlert
        open={openRejectDeploymentAlert}
        onOpenChange={setOpenRejectDeploymentAlert}
        onSuccess={rejectDeployment}
        deploymentName={deployment?.name ?? "Unknown"}
      />
    </div>
  );
}

const LoadingSection = () => {
  return (
    <div className="space-y-2 p-10">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};
