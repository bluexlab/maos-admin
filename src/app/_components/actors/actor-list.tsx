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
import { AddActorDialog } from "./add-actor-dialog";
import { EditActorDialog } from "./edit-actor-dialog";
import { RemoveActorAlert } from "./remove-actor-alert";
import Link from "next/link";

type Actor = {
  id: number;
  name: string;
  role: string;
  created_at: number;
  renameable: boolean;
  deployable: boolean;
  configurable: boolean;
  migratable: boolean;
  token_count: number;
};

const ActorList = ({
  actors,
  currentPage,
  totalPages,
}: {
  session: Session;
  actors: Actor[];
  currentPage: number;
  totalPages: number;
}) => {
  const router = useRouter();
  const [openAddActorDialog, setOpenAddActorDialog] = useState(false);
  const [openEditActorDialog, setOpenEditActorDialog] = useState(false);
  const [openRemoveActorAlert, setOpenRemoveActorAlert] = useState(false);
  const [actorIdToRemove, setActorIdToRemove] = useState<number | null>(null);
  const [actorToEdit, setActorToEdit] = useState<Actor | null>(null);
  const removeMutation = api.actors.remove.useMutation({
    onSuccess: () => {
      setOpenRemoveActorAlert(false);
      toast.success("Actor removed successfully");
      router.refresh();
    },
    onError: (err) => {
      toast.error("Failed to remove actor: " + err.message, { duration: 0 });
      setOpenRemoveActorAlert(false);
    },
  });

  const alertRemoveActor = (id: number) => {
    setActorIdToRemove(id);
    setOpenRemoveActorAlert(true);
  };

  const editActor = (actor: Actor) => {
    setActorToEdit(actor);
    setOpenEditActorDialog(true);
  };

  const removeActor = () => {
    if (actorIdToRemove !== null) {
      removeMutation.mutate({ id: actorIdToRemove });
    }
    setOpenRemoveActorAlert(false);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>
              <div className="flex items-center justify-center">Deployable</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center justify-center">Configurable</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center justify-center">Migratable</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center justify-center">Role</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center justify-center">Tokens</div>
            </TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actors.map((actor) => (
            <TableRow key={actor.id}>
              <TableCell>{actor.name}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  {actor.deployable ? "✓" : ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  {actor.configurable ? "✓" : ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  {actor.migratable ? "✓" : ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">{actor.role}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Link className="text-blue-500 underline" href={`/actors/${actor.id}/tokens`}>
                    {actor.token_count}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="w-20">
                <Button onClick={() => editActor(actor)}>Edit</Button>
              </TableCell>
              <TableCell className="w-20">
                {actor.renameable && (
                  <Button variant="danger" onClick={() => alertRemoveActor(actor.id)}>
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
        pageUrl={(page) => `/actors?page=${clamp(page, 1, totalPages)}`}
      />
      <Button className="w-64" onClick={() => setOpenAddActorDialog(true)}>
        Add Actor
      </Button>

      <AddActorDialog open={openAddActorDialog} onOpenChange={setOpenAddActorDialog} />

      {openEditActorDialog && (
        <EditActorDialog
          open={openEditActorDialog}
          onOpenChange={setOpenEditActorDialog}
          actor={actorToEdit}
        />
      )}

      <RemoveActorAlert
        open={openRemoveActorAlert}
        onOpenChange={setOpenRemoveActorAlert}
        onSuccess={removeActor}
        actorName={actors.find((actor) => actor.id === actorIdToRemove)?.name ?? ""}
      />
    </div>
  );
};

export default ActorList;
