"use client";

import { useState } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

type ConfigEditorProps = {
  deploymentId: bigint;
  config: {
    id: number;
    minAgentVersion?: string;
    content: Record<string, string>;
  };
  onSave: () => void;
};

type ConfigEntry = {
  key: string;
  value: string;
};

type FormValues = {
  entries: ConfigEntry[];
};

export function ConfigEditor({ config, deploymentId, onSave }: ConfigEditorProps) {
  const [minAgentVersion, setMinAgentVersion] = useState<string>("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      entries: Object.entries(config.content).map(([key, value]) => ({ key, value })),
    },
  });

  const mutation = api.deployments.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration updated");
      onSave();
    },
    onError: () => {
      toast.error("Failed to update configuration");
    },
  });
  const loading = mutation.status === "pending";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const content = data.entries.reduce(
      (acc, entry) => {
        acc[entry.key] = entry.value;
        return acc;
      },
      {} as Record<string, string>,
    );
    mutation.mutate({ id: deploymentId, configId: BigInt(config.id), content, minAgentVersion });
  };

  const validateUniqueKey = (key: string, index: number) => {
    const entries = getValues("entries");
    return entries.every((entry, i) => i === index || entry.key !== key) || "Key must be unique";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Minimal Agent Version
          </Label>
          <Input
            id="minAgentVersion"
            className="col-span-3"
            value={minAgentVersion}
            onChange={(e) => setMinAgentVersion(e.target.value)}
          />
        </div>
      </div>
      <div className="my-4">
        <hr className="border-t border-gray-300" />
      </div> */}
      <div className="grid gap-4 bg-slate-800 p-4">
        <div className="grid grid-cols-11 items-center gap-4">
          <div className="col-span-2 flex items-center justify-center">Config Key</div>
          <div className="col-span-2 flex items-center justify-center">Value</div>
          <div className="col-span-2 flex items-center justify-center">QA</div>
          <div className="col-span-2 flex items-center justify-center">Staging</div>
          <div className="col-span-2 flex items-center justify-center">Production</div>
          <div className="col-span-1 flex items-center justify-center"></div>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-11 items-center gap-4">
            <Input
              className="col-span-2"
              {...register(`entries.${index}.key`, {
                required: "Key is required",
                validate: (value) => validateUniqueKey(value, index),
              })}
              placeholder="Key"
            />
            <Input
              className="col-span-2"
              {...register(`entries.${index}.value`, { required: "Value is required" })}
              placeholder="Value"
            />
            <Input className="col-span-2" disabled value={""} />
            <Input className="col-span-2" disabled value={""} />
            <Input className="col-span-2" disabled value={""} />

            <Button type="button" onClick={() => remove(index)} className="col-span-1">
              Remove
            </Button>
            {errors.entries?.[index]?.key && (
              <span className="col-span-4 text-red-500">{errors.entries[index]?.key?.message}</span>
            )}
            {errors.entries?.[index]?.value && (
              <span className="col-span-4 text-red-500">
                {errors.entries[index]?.value?.message}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mx-4 mt-1 flex">
        <Button
          type="button"
          className="w-40"
          loading={loading}
          onClick={() => append({ key: "", value: "" })}
        >
          New Config Entry
        </Button>
        <Button type="submit" className="ml-2 w-40" loading={loading}>
          Save Configuration
        </Button>
      </div>
    </form>
  );
}
