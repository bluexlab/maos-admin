import AppFrame from "~/app/_components/app-frame";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  const data = await api.pods.list();

  const formatMemory = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <AppFrame session={session}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Running Pods</h1>
      </div>
      {data.data ? (
        <div className="w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>CPU Usage</TableHead>
                <TableHead>Memory Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((pod) => (
                <TableRow key={pod.name}>
                  <TableCell>{pod.name}</TableCell>
                  <TableCell>{pod.cpu}m</TableCell>
                  <TableCell>{formatMemory(pod.memory)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-red-500">Error: {data.error}</div>
      )}
    </AppFrame>
  );
}
