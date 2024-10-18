"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

type ReferenceType = {
  suite_name: string;
  configs: Record<string, string>;
};

type ConfigEditorProps = {
  config: {
    id: number;
    content: Record<string, string>;
  };
  references: ReferenceType[];
};

export function ConfigViewer({ config, references }: ConfigEditorProps) {
  const referenceNames = references.map((reference) => reference.suite_name);
  return (
    <div className="w-full bg-slate-800 p-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-1">Config Key</th>
            <th className="p-1">Value</th>
            {referenceNames.map((key) => (
              <th key={key} className="p-1">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(config.content)
            .sort(([a], [b]) => {
              // Sort KUBE_MIGRATE to the top, then KUBE_, then the rest
              const getPriority = (key: string): number => {
                if (key.startsWith("KUBE_MIGRATE")) return 0;
                if (key.startsWith("KUBE_")) return 1;
                return 2;
              };

              const priorityA = getPriority(a);
              const priorityB = getPriority(b);

              if (priorityA !== priorityB) {
                return priorityA - priorityB;
              }

              return a.localeCompare(b);
            })
            .map(([key, value]) => (
              <tr key={key}>
                <td className="p-1">
                  <Label className="col-span-2">{key}</Label>
                </td>
                <td className="p-1">
                  <Input className="col-span-2" value={value} disabled />
                </td>
                {references.map((reference) => (
                  <td key={reference.suite_name} className="p-1">
                    <Input
                      className={cn(
                        "disabled:opacity-100",
                        reference.configs[key] === value ? "bg-green-800" : "bg-red-800",
                      )}
                      disabled
                      value={reference.configs[key]}
                    />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* <div className="grid grid-cols-11 items-center gap-4">
        <div className="col-span-2 flex items-center justify-center">Config Key</div>
        <div className="col-span-2 flex items-center justify-center">Value</div>
        <div className="col-span-2 flex items-center justify-center">QA</div>
        <div className="col-span-2 flex items-center justify-center">Staging</div>
        <div className="col-span-2 flex items-center justify-center">Production</div>
        <div className="col-span-1 flex items-center justify-center"></div>
      </div>
      {Object.entries(config.content).map(([key, value]) => (
        <div key={key} className="grid grid-cols-10 items-center gap-4">
          <Label className="col-span-2">{key}</Label>
          <Input className="col-span-2" value={value} disabled />
          <Input className="col-span-2" disabled value={""} />
          <Input className="col-span-2" disabled value={""} />
          <Input className="col-span-2" disabled value={""} />
        </div>
      ))} */}
    </div>
  );
}
