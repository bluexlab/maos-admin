import { TRPCError } from "@trpc/server";
import { describe, vi } from "vitest";

import { settings } from "~/drizzle/schema";
import { decryptApiToken } from "~/lib/apiToken";
import { testWithDb } from "~/test/integration/fixtures/db-fixtures";
import { useCaller } from "~/test/integration/helpers/test-caller";
import { useSession } from "~/test/integration/helpers/test-session";

describe.concurrent("settingRouter API", () => {
  describe("without session", () => {
    const session = null;

    testWithDb("get returns UNAUTHORIZED", async ({ expect, db }) => {
      const { caller } = useCaller({ db, session });
      await expect(caller.settings.get()).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
    });

    testWithDb("update returns UNAUTHORIZED", async ({ expect, db }) => {
      const { caller } = useCaller({ db, session });
      await expect(caller.settings.update({ apiToken: "test-token" })).rejects.toThrow(
        new TRPCError({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("with valid session", () => {
    testWithDb("get returns settings", async ({ expect, db }) => {
      const { session } = await useSession(db);
      const { caller } = useCaller({ db, session });

      const mockSettings = {
        deployment_approve_required: true,
        cluster_name: "dev",
      };

      // Mock fetch directly
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSettings,
        headers: new Headers({
          "Content-Length": JSON.stringify(mockSettings).length.toString(),
        }),
      });

      try {
        const result = await caller.settings.get();
        expect(result).toEqual({ data: mockSettings });

        // Verify that fetch was called with the correct URL and custom request object
        expect(global.fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "http://localhost:5001/v1/admin/setting",
            method: "GET",
          }),
        );
      } finally {
        // Restore the original fetch function
        global.fetch = originalFetch;
      }
    });

    testWithDb("update creates new API token", async ({ expect, db }) => {
      const { session } = await useSession(db);
      const { caller } = useCaller({ db, session });

      const newToken = "new-api-token";
      await caller.settings.update({ apiToken: newToken });

      const settingsEntries = await db.select().from(settings);
      expect(settingsEntries).toHaveLength(1);
      expect(settingsEntries[0]?.key).toBe("api-token");
      expect(await decryptApiToken(settingsEntries[0]?.value ?? "")).toBe(newToken);
    });

    testWithDb("update replaces existing API token", async ({ expect, db }) => {
      const { session } = await useSession(db);
      const { caller } = useCaller({ db, session });

      const oldToken = "old-api-token";
      await db.insert(settings).values({ key: "api-token", value: oldToken });

      const newToken = "new-api-token";
      await caller.settings.update({ apiToken: newToken });

      const settingsEntries = await db.select().from(settings);
      expect(settingsEntries).toHaveLength(1);
      expect(settingsEntries[0]?.key).toBe("api-token");
      expect(await decryptApiToken(settingsEntries[0]?.value ?? "")).toBe(newToken);
    });
  });
});
