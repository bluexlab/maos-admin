"use client";

import { type Session } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

const SettingList = ({}: { session: Session }) => {
  const [apiToken, setApiToken] = useState("");
  const mutation = api.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings updated");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      apiToken,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token</Label>
          <Input
            id="apiToken"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your API token"
          />
        </div>
        <Button type="submit" className="w-40" loading={mutation.status === "pending"}>
          Update
        </Button>
      </form>
    </div>
  );
};

export default SettingList;
