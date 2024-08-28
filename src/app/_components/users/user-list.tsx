"use client";

import { type Session } from "next-auth";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Paginator from "~/app/_components/paginator";
import { clamp } from "~/lib/numbers";
import { useState } from "react";
import { AddUserDialog } from "./add-user-dialog";
import { RemoveUserAlert } from "./remove-uesr-alert";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = {
  name: string | null;
  email: string;
};

const UserList = ({
  session,
  users,
  currentPage,
  totalPages,
}: {
  session: Session;
  users: User[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
}) => {
  const router = useRouter();
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openRemoveUserAlert, setOpenRemoveUserAlert] = useState(false);
  const [emailToRemove, setEmailToRemove] = useState("");
  const removeMutation = api.users.remove.useMutation({
    onSuccess: () => {
      setOpenRemoveUserAlert(false);
      toast.success("User removed successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to remove user");
      setOpenRemoveUserAlert(false);
    },
  });

  const alertRemoveUser = (email: string) => {
    setEmailToRemove(email);
    setOpenRemoveUserAlert(true);
  };

  const removeUser = () => {
    removeMutation.mutate({ email: emailToRemove });
    setOpenRemoveUserAlert(false);
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.name ?? "(wait for user to sign in)"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="w-20">
                {user.email !== session.user.email && (
                  <Button variant="danger" onClick={() => alertRemoveUser(user.email)}>
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
        pageUrl={(page) => `/users?page=${clamp(page, 1, totalPages)}`}
      />
      <Button className="w-64" onClick={() => setOpenAddUserDialog(true)}>
        Add User
      </Button>

      <AddUserDialog open={openAddUserDialog} onOpenChange={setOpenAddUserDialog} />
      <RemoveUserAlert
        open={openRemoveUserAlert}
        onOpenChange={setOpenRemoveUserAlert}
        onSuccess={removeUser}
        email={emailToRemove}
      />
    </div>
  );
};

export default UserList;
