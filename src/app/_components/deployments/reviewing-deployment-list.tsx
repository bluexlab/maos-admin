"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";

export default function ReviewingDeploymentsList({
  currentUserEmail,
}: {
  currentUserEmail: string;
}) {
  const reviewingDeployments = api.deployments.list.useQuery({
    status: "reviewing",
    reviewer: currentUserEmail,
  });

  if (!reviewingDeployments.data?.data || reviewingDeployments.data.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewing Deployments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full rounded-lg shadow-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewingDeployments.data.data.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment.name}</TableCell>
                <TableCell>{deployment.status}</TableCell>
                <TableCell>{deployment.created_by}</TableCell>
                <TableCell>
                  {deployment.created_at && (
                    <p>
                      {new Date(deployment.created_at * 1000).toLocaleString("en-US", {
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
                <TableCell className="w-20">
                  <Button asChild>
                    <Link href={`/deployments/${deployment.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
