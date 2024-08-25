"use client";

import { Settings, X } from "lucide-react";
import { type Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { PublishDeploymentAlert, RemoveDeploymentAlert, SubmitDeploymentAlert } from "./alerts";
import { ConfigEditor } from "./config-editor";
import { ConfigViewer } from "./config-viewer";
import ConfigSuitesSelectDialog from "./config-suites-select-dialog";

export default function DeploymentEditor({
  deploymentId,
  session,
  approveRequired,
  allSuites,
}: {
  deploymentId: number;
  session: Session;
  approveRequired: boolean;
  allSuites: string[];
}) {
  const router = useRouter();
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [selectedSuites, setSelectedSuites] = useState<string[]>(allSuites);
  const [openSubmitDeploymentAlert, setOpenSubmitDeploymentAlert] = useState(false);
  const [openPublishDeploymentAlert, setOpenPublishDeploymentAlert] = useState(false);
  const [openRemoveDeploymentAlert, setOpenRemoveDeploymentAlert] = useState(false);
  const [openConfigSuitesSelectDialog, setOpenConfigSuitesSelectDialog] = useState(false);
  const [addedDeploymentIds, setAddedDeploymentIds] = useState<number[]>([]);

  const { data, refetch, isLoading } = api.deployments.get.useQuery({ id: deploymentId });
  const { data: users } = api.users.list.useQuery({});
  const { data: referenceConfigs } = api.referenceConfigs.list.useQuery({
    referenceConfigs: selectedSuites,
    deployments: addedDeploymentIds,
  });

  const editingDeployment = data?.data;
  const agents = editingDeployment?.configs?.sort((a, b) =>
    a.agent_name.localeCompare(b.agent_name),
  );

  // Set reviewers from deployment
  useEffect(() => {
    if (editingDeployment?.reviewers) {
      setReviewers(editingDeployment.reviewers);
    }
  }, [editingDeployment]);

  const availableReviewers =
    users?.data.filter(
      (user) => !reviewers.includes(user.email) && user.email !== session.user.email,
    ) ?? [];

  const updateMutation = api.deployments.update.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeDeploymentMutation = api.deployments.remove.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Deployment removed");
        router.push(`/deployments`);
        router.refresh();
      } else {
        toast.error("Failed to remove deployment: " + data.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submitMutation = api.deployments.submit.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Deployment submitted");
        router.push(`/deployments`);
        router.refresh();
      } else {
        toast.error("Failed to submit deployment: " + data.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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

  const addReviewer = (reviewer: string) => {
    const updatedReviewers = [...reviewers, reviewer];
    setReviewers(updatedReviewers);
    updateMutation.mutate({ id: editingDeployment!.id, reviewers: updatedReviewers });
  };

  const removeReviewer = (reviewer: string) => {
    const updatedReviewers = reviewers.filter((r) => r !== reviewer);
    setReviewers(updatedReviewers);
    updateMutation.mutate({ id: editingDeployment!.id, reviewers: updatedReviewers });
  };

  const removeDeployment = () => {
    setOpenRemoveDeploymentAlert(false);
    removeDeploymentMutation.mutate({ id: editingDeployment!.id });
  };

  const submitDeployment = () => {
    setOpenSubmitDeploymentAlert(false);
    submitMutation.mutate({ id: editingDeployment!.id });
  };

  const publishDeployment = () => {
    setOpenPublishDeploymentAlert(false);
    publishMutation.mutate({ id: editingDeployment!.id });
  };

  const editable = ["draft"].includes(editingDeployment?.status ?? "unknown");

  return (
    <div className="flex flex-col gap-4">
      {approveRequired && editable && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSection />
            ) : (
              <div className="flex flex-wrap gap-4">
                {reviewers.map((reviewer) => (
                  <Badge key={reviewer} className="h-10">
                    <p className="ml-1 text-sm">{reviewer}</p>
                    <Button
                      className="ml-1 h-5 rounded-sm px-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                      onClick={() => removeReviewer(reviewer)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Badge>
                ))}
                {availableReviewers?.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>Add</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {availableReviewers?.map((user) => (
                        <DropdownMenuItem key={user.email} onClick={() => addReviewer(user.email)}>
                          <p>{user.email}</p>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Agents Config</CardTitle>
            <Button variant="outline" onClick={() => setOpenConfigSuitesSelectDialog(true)}>
              <Settings />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSection />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {agents?.map((agent) => (
                <AccordionItem key={agent.agent_id} value={`item-${agent.agent_id}`}>
                  <AccordionTrigger className="px-4 data-[state=open]:bg-slate-800">
                    {agent.agent_name}
                  </AccordionTrigger>
                  <AccordionContent>
                    {editable ? (
                      <ConfigEditor
                        config={agent}
                        deploymentId={BigInt(editingDeployment!.id)}
                        onSave={refetch}
                        references={referenceConfigs?.data?.[agent.agent_name]?.config_suites ?? []}
                      />
                    ) : (
                      <ConfigViewer
                        config={agent}
                        references={referenceConfigs?.data?.[agent.agent_name]?.config_suites ?? []}
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {editable && (
        <div className="mt-6 flex gap-4">
          {approveRequired ? (
            <Button onClick={() => setOpenSubmitDeploymentAlert(true)}>Submit for Review</Button>
          ) : (
            <Button onClick={() => setOpenPublishDeploymentAlert(true)}>Publish</Button>
          )}
          <Button variant="danger" onClick={() => setOpenRemoveDeploymentAlert(true)}>
            Remove
          </Button>
        </div>
      )}

      <RemoveDeploymentAlert
        open={openRemoveDeploymentAlert}
        onOpenChange={setOpenRemoveDeploymentAlert}
        onSuccess={removeDeployment}
        deploymentName={editingDeployment?.name ?? "Unknown"}
      />

      <SubmitDeploymentAlert
        open={openSubmitDeploymentAlert}
        onOpenChange={setOpenSubmitDeploymentAlert}
        onSuccess={submitDeployment}
        deploymentName={editingDeployment?.name ?? "Unknown"}
      />

      <PublishDeploymentAlert
        open={openPublishDeploymentAlert}
        onOpenChange={setOpenPublishDeploymentAlert}
        onSuccess={publishDeployment}
        deploymentName={editingDeployment?.name ?? "Unknown"}
      />

      <ConfigSuitesSelectDialog
        availableSuites={allSuites}
        selectedSuites={selectedSuites}
        open={openConfigSuitesSelectDialog}
        onSelected={(selected, deployments) => {
          setSelectedSuites(selected);
          setAddedDeploymentIds(deployments);
        }}
        onOpenChange={setOpenConfigSuitesSelectDialog}
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
