import { NextRequest } from "next/server";

export function createNextRequest(body: Buffer, headers: Record<string, string> = {}) {
  return new NextRequest(
    new Request('https://example.com/api/file/org', {
      method: 'POST',
      body,
      headers,
      // eslint-disable-next-line
      // @ts-ignore. duplex is not part of ts spec for now
      duplex: 'half',
    })
  );
}
