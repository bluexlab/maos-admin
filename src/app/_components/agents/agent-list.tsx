"use client";

import { type Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Paginator from "~/app/_components/paginator";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { clamp } from "~/lib/numbers";
import { api } from "~/trpc/react";
import { AddAgentDialog } from "./add-agent-dialog";
import { EditAgentDialog } from "./edit-agent-dialog";
import { RemoveAgentAlert } from "./remove-agent-alert";

type Agent = {
  id: number;
  name: string;
  created_at: number;
  updatable: boolean;
};

const AgentList = ({
  agents,
  currentPage,
  totalPages,
}: {
  session: Session;
  agents: Agent[];
  currentPage: number;
  totalPages: number;
}) => {
  const router = useRouter();
  const [openAddAgentDialog, setOpenAddAgentDialog] = useState(false);
  const [openEditAgentDialog, setOpenEditAgentDialog] = useState(false);
  const [openRemoveAgentAlert, setOpenRemoveAgentAlert] = useState(false);
  const [agentIdToRemove, setAgentIdToRemove] = useState<number | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const removeMutation = api.agents.remove.useMutation({
    onSuccess: () => {
      setOpenRemoveAgentAlert(false);
      toast.success("Agent removed successfully");
      router.refresh();
    },
    onError: (err) => {
      toast.error("Failed to remove agent: " + err.message);
      setOpenRemoveAgentAlert(false);
    },
  });

  const alertRemoveAgent = (id: number) => {
    setAgentIdToRemove(id);
    setOpenRemoveAgentAlert(true);
  };

  const editAgent = (agent: Agent) => {
    setAgentToEdit(agent);
    setOpenEditAgentDialog(true);
  };

  const removeAgent = () => {
    if (agentIdToRemove !== null) {
      removeMutation.mutate({ id: agentIdToRemove });
    }
    setOpenRemoveAgentAlert(false);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>Created at</TableHead> */}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.name}</TableCell>
              <TableCell className="w-20">
                {agent.updatable && <Button onClick={() => editAgent(agent)}>Edit</Button>}
              </TableCell>
              <TableCell className="w-20">
                {agent.updatable && (
                  <Button variant="danger" onClick={() => alertRemoveAgent(agent.id)}>
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Paginator
        totalPages={totalPages}
        currentPage={currentPage}
        pageUrl={(page) => `/agents?page=${clamp(page, 1, totalPages)}`}
      />
      <Button className="w-64" onClick={() => setOpenAddAgentDialog(true)}>
        Add Agent
      </Button>

      <AddAgentDialog open={openAddAgentDialog} onOpenChange={setOpenAddAgentDialog} />

      {openEditAgentDialog && (
        <EditAgentDialog
          open={openEditAgentDialog}
          onOpenChange={setOpenEditAgentDialog}
          agent={agentToEdit}
        />
      )}

      <RemoveAgentAlert
        open={openRemoveAgentAlert}
        onOpenChange={setOpenRemoveAgentAlert}
        onSuccess={removeAgent}
        agentName={agents.find((agent) => agent.id === agentIdToRemove)?.name ?? ""}
      />
    </div>
  );
};

export default AgentList;
