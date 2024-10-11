"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { SetSecretDialog } from "./set-secret-dialog";

type Secret = { name: string; keys: string[] };

const SecretList = ({ secrets }: { secrets: Secret[] }) => {
  const router = useRouter();
  const [openSetSecretDialog, setOpenSetSecretDialog] = useState(false);
  const [addingSecret, setAddingSecret] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [addingKey, setAddingKey] = useState("");
  const [nameOfAddingKey, setNameOfAddingKey] = useState("");
  const [settingNameKey, setSettingNameKey] = useState({ name: "", key: "" });
  const mutationAddSecret = api.secrets.create.useMutation({
    onSuccess: () => {
      toast.success("Secret created");
      setAddingName("");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 0 });
    },
  });
  const mutationDeleteSecret = api.secrets.delete.useMutation({
    onSuccess: () => {
      toast.success("Secret deleted");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 0 });
    },
  });
  const mutationUpdateKey = api.secrets.updateKey.useMutation({
    onSuccess: () => {
      toast.success("Key updated");
      setAddingKey("");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 0 });
    },
  });
  const mutationDeleteKey = api.secrets.deleteKey.useMutation({
    onSuccess: () => {
      toast.success("Key deleted");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 0 });
    },
  });
  const updating =
    mutationAddSecret.status === "pending" ||
    mutationUpdateKey.status === "pending" ||
    mutationDeleteKey.status === "pending" ||
    mutationDeleteSecret.status === "pending";

  const addSecret = () => {
    mutationAddSecret.mutate({ name: addingName });
    setAddingSecret(false);
  };

  const deleteSecret = (name: string) => {
    confirm("Are you sure you want to delete this secret?");
    mutationDeleteSecret.mutate({ name });
  };

  const addKey = (name: string, key: string) => {
    mutationUpdateKey.mutate({ name, key, value: "-" });
    setNameOfAddingKey("");
  };

  const updateKey = (name: string, key: string) => {
    setSettingNameKey({ name, key });
    setOpenSetSecretDialog(true);
  };

  const deleteKey = (name: string, key: string) => {
    confirm("Are you sure you want to delete this key?");
    mutationDeleteKey.mutate({ name, key });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Secret Name</TableHead>
            <TableHead className="w-1/2">Secret Key</TableHead>
            <TableHead className="w-40"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secrets
            .sort((a, b) => a.name.localeCompare(b.name))
            .flatMap((secret) => {
              const keys = secret.keys.length > 0 ? secret.keys : [""];
              return [
                ...keys.sort().map((key, index) => (
                  <TableRow key={`${secret.name}-${key}`}>
                    {index === 0 ? (
                      <TableCell
                        rowSpan={
                          secret.keys.length > 0
                            ? secret.keys.length + (nameOfAddingKey === secret.name ? 1 : 0)
                            : undefined
                        }
                      >
                        <div className="flex flex-col items-start gap-2">
                          {secret.name}
                          {!addingSecret && nameOfAddingKey === "" && (
                            <div className="flex gap-2">
                              <Button
                                disabled={updating}
                                onClick={() => setNameOfAddingKey(secret.name)}
                              >
                                Add Key
                              </Button>
                              <Button
                                disabled={updating}
                                variant="destructive"
                                onClick={() => deleteSecret(secret.name)}
                              >
                                Delete Secret
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ) : null}

                    {(secret.keys.length > 0 && nameOfAddingKey !== secret.name) || key !== "" ? (
                      <>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              disabled={updating || addingSecret || nameOfAddingKey !== ""}
                              onClick={() => updateKey(secret.name, key)}
                            >
                              Set
                            </Button>
                            <Button
                              disabled={updating || addingSecret || nameOfAddingKey !== ""}
                              variant="destructive"
                              onClick={() => deleteKey(secret.name, key)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      nameOfAddingKey === secret.name && (
                        <>
                          <TableCell>
                            <Input
                              value={addingKey}
                              onChange={(e) => setAddingKey(e.target.value)}
                              autoFocus
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                disabled={updating}
                                onClick={() => {
                                  addKey(secret.name, addingKey);
                                }}
                              >
                                Save
                              </Button>
                              <Button disabled={updating} onClick={() => setNameOfAddingKey("")}>
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )
                    )}
                  </TableRow>
                )),
                ...(secret.keys.length > 0 && nameOfAddingKey === secret.name
                  ? [
                      <TableRow key={`${nameOfAddingKey}-new`}>
                        <TableCell>
                          <Input
                            value={addingKey}
                            onChange={(e) => setAddingKey(e.target.value)}
                            autoFocus
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              disabled={updating}
                              onClick={() => {
                                addKey(secret.name, addingKey);
                              }}
                            >
                              Save
                            </Button>
                            <Button disabled={updating} onClick={() => setNameOfAddingKey("")}>
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                    ]
                  : []),
              ];
            })}
          {addingSecret && (
            <TableRow>
              <TableCell>
                <Input
                  value={addingName}
                  onChange={(e) => setAddingName(e.target.value)}
                  autoFocus
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button loading={mutationAddSecret.status === "pending"} onClick={addSecret}>
                    Save
                  </Button>
                  <Button onClick={() => setAddingSecret(false)}>Cancel</Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {nameOfAddingKey === "" && (
        <Button className="w-64" onClick={() => setAddingSecret(true)}>
          Add Secret
        </Button>
      )}

      <SetSecretDialog
        secretName={settingNameKey.name}
        secretKey={settingNameKey.key}
        open={openSetSecretDialog}
        onOpenChange={setOpenSetSecretDialog}
      />
    </div>
  );
};

export default SecretList;
