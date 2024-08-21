"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type ConfigEditorProps = {
  config: {
    id: number;
    minAgentVersion?: string;
    content: Record<string, string>;
  };
};

export function ConfigViewer({ config }: ConfigEditorProps) {
  return (
    <div className="grid gap-4 bg-slate-800 p-4">
      <div className="grid grid-cols-11 items-center gap-4">
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
      ))}
    </div>
  );
}
