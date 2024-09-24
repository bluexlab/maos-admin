"use client";

import { LockKeyhole, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type ReferenceType = {
  suite_name: string;
  configs: Record<string, string>;
};

type ConfigEditorProps = {
  deploymentId: bigint;
  config: {
    id: number;
    minAgentVersion?: string;
    content: Record<string, string>;
  };
  references: ReferenceType[];
  onSave: () => void;
};

type ConfigEntry = {
  key: string;
  value: string;
};

type FormValues = {
  entries: ConfigEntry[];
};

export function ConfigEditor({ config, deploymentId, references, onSave }: ConfigEditorProps) {
  const allKeys = useMemo(() => {
    const keySet = new Set(Object.keys(config.content));
    references.forEach((reference) => {
      Object.keys(reference.configs).forEach((key) => keySet.add(key));
    });
    return Array.from(keySet).sort();
  }, [references, config.content]);
  const referenceNames = references.map((reference) => reference.suite_name);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      entries: allKeys.map((key) => ({ key, value: config.content[key] })),
    },
  });

  const mutation = api.deployments.updateConfig.useMutation({
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Configuration updated");
        onSave();
      } else {
        toast.error(data.error);
      }
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
    mutation.mutate({ id: deploymentId, configId: BigInt(config.id), content });
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
      <div className="w-full bg-slate-800 p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-1">Config Key</th>
              <th className="p-1">Value</th>
              <th className="w-6">
                <div className="flex items-center justify-center">
                  <LockKeyhole className="h-5 w-5" />
                </div>
              </th>
              {referenceNames.map((key) => (
                <th key={key} className="p-1">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td className="p-1">
                  <Input
                    className="col-span-2"
                    {...register(`entries.${index}.key`, {
                      required: "Key is required",
                      validate: (value) => validateUniqueKey(value, index),
                    })}
                    placeholder="Key"
                  />
                  {errors.entries?.[index]?.key && (
                    <span className="col-span-4 text-red-500">
                      {errors.entries[index]?.key?.message}
                    </span>
                  )}
                </td>
                <td className="p-1">
                  <Input className="col-span-2" {...register(`entries.${index}.value`)} />
                  {errors.entries?.[index]?.value && (
                    <span className="col-span-4 text-red-500">
                      {errors.entries[index]?.value?.message}
                    </span>
                  )}
                </td>
                <td className="w-6">
                  {watch(`entries.${index}.key`).startsWith("KUBE_") !== true && (
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={watch(`entries.${index}.value`).startsWith("[[SECRET]]")}
                        onClick={() => {
                          const currentValue = watch(`entries.${index}.value`);
                          const checked = currentValue.startsWith("[[SECRET]]");
                          console.log("clicked", checked, currentValue);
                          if (!checked && !currentValue.startsWith("[[SECRET]]")) {
                            setValue(`entries.${index}.value`, `[[SECRET]]${currentValue}`);
                          } else if (checked && currentValue.startsWith("[[SECRET]]")) {
                            console.log("unchecking");
                            setValue(`entries.${index}.value`, currentValue.slice(10));
                          }
                        }}
                      />
                    </div>
                  )}
                </td>
                {references.map((reference) => (
                  <td key={reference.suite_name} className="p-1">
                    <Input
                      className={cn(
                        "disabled:opacity-100",
                        reference.configs[field.key] === watch(`entries.${index}.value`)
                          ? "bg-green-800"
                          : "bg-red-800",
                      )}
                      disabled
                      value={reference.configs[field.key]}
                    />
                  </td>
                ))}
                <td className="w-6 p-1">
                  <Button type="button" onClick={() => remove(index)} className="col-span-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
