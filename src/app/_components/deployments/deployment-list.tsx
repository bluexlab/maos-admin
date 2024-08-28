"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type components } from "~/types/maos-core-scheme";
import { AddDeploymentDialog } from "./add-deployment-dialog";

type Deployment = components["schemas"]["Deployment"];

const DeploymentList = ({ deployments }: { deployments: Deployment[] }) => {
  const [openAddDeploymentDialog, setOpenAddDeploymentDialog] = useState(false);

  return (
    <div className="flex w-full flex-col gap-4">
      <Table className="w-full rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Deployed At</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell>{deployment.name}</TableCell>
              <TableCell>{deployment.status}</TableCell>
              <TableCell>{deployment.created_by}</TableCell>
              <TableCell>
                {deployment.approved_at && (
                  <p>
                    {new Date(deployment.approved_at * 1000).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Singapore",
                    })}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {deployment.notes &&
                  Object.entries(deployment.notes as Record<string, string>).map(([key, value]) => (
                    <div key={key}>{`${key}: ${value}`}</div>
                  ))}
              </TableCell>
              <TableCell className="w-20">
                {deployment.status === "draft" ? (
                  <Button asChild>
                    <Link href={`/deployments/${deployment.id}`}>Edit</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/deployments/${deployment.id}`}>View</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button className="w-64" onClick={() => setOpenAddDeploymentDialog(true)}>
        Add Deployment
      </Button>

      <AddDeploymentDialog
        open={openAddDeploymentDialog}
        onOpenChange={setOpenAddDeploymentDialog}
      />
    </div>
  );
};

export default DeploymentList;
