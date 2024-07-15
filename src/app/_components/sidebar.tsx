import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="px-3 py-2">
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start">
            <svg
              className="mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21,12.22C21,6.73,16.74,3,12,3c-4.69,0-9,3.65-9,9.28C2.4,12.62,2,13.26,2,14v2c0,1.1,0.9,2,2,2h1v-6.1 c0-3.87,3.13-7,7-7s7,3.13,7,7V19h-8v2h8c1.1,0,2-0.9,2-2v-1.22c0.59-0.31,1-0.92,1-1.64v-2.3C22,13.14,21.59,12.53,21,12.22z" />
              <circle cx="9" cy="13" r="1" />
              <circle cx="15" cy="13" r="1" />
              <path d="M18,11.03C17.52,8.18,15.04,6,12.05,6c-3.03,0-6.29,2.51-6.03,6.45c2.47-1.01,4.33-3.21,4.86-5.89 C12.19,9.19,14.88,11,18,11.03z" />
            </svg>
            Agents
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              viewBox="0 0 32 32"
            >
              <path d="M16 23.36a7.37 7.37 0 1 0-.02-14.74A7.37 7.37 0 0 0 16 23.36zm-3.64-1.81V20.5c0-1.6 1.03-2.98 2.57-3.46a.36.36 0 0 0 .07-.66 2.14 2.14 0 1 1 2 0 .36.36 0 0 0 .07.66 3.62 3.62 0 0 1 2.57 3.46v1.05a6.6 6.6 0 0 1-7.28 0zM16 9.36A6.65 6.65 0 0 1 20.36 21v-.5c0-1.68-.95-3.17-2.44-3.9.6-.53.94-1.29.94-2.1a2.86 2.86 0 0 0-5.72 0c0 .81.35 1.57.94 2.1a4.32 4.32 0 0 0-2.44 3.9v.5A6.62 6.62 0 0 1 16 9.36zm13.5 8.78c-.9 0-1.66.65-1.82 1.5h-2.32v-7.28h2.32a1.86 1.86 0 1 0 0-.72h-2.32V7c0-.2-.16-.36-.36-.36h-4.64V4.32a1.86 1.86 0 1 0-.72 0v2.32h-7.28V4.32a1.86 1.86 0 1 0-.72 0v2.32H7c-.2 0-.36.16-.36.36v4.64H4.32a1.86 1.86 0 1 0 0 .72h2.32v7.28H4.32a1.86 1.86 0 1 0 0 .72h2.32V25c0 .2.16.36.36.36h4.64v2.32a1.86 1.86 0 1 0 .72 0v-2.32h7.28v2.32a1.86 1.86 0 0 0 .36 3.68 1.86 1.86 0 0 0 .36-3.68v-2.32H25c.2 0 .36-.16.36-.36v-4.64h2.32a1.86 1.86 0 0 0 3.68-.36c0-1.03-.84-1.86-1.86-1.86zm0-7.28a1.14 1.14 0 1 1 0 2.28 1.14 1.14 0 0 1 0-2.28zM18.86 2.5a1.14 1.14 0 1 1 2.28 0 1.14 1.14 0 0 1-2.28 0zm-8 0a1.14 1.14 0 0 1 2.28 0 1.14 1.14 0 0 1-2.28 0zM2.5 13.14a1.14 1.14 0 0 1 0-2.28 1.14 1.14 0 0 1 0 2.28zm0 8a1.14 1.14 0 1 1 0-2.28 1.14 1.14 0 0 1 0 2.28zm10.64 8.36a1.14 1.14 0 1 1-2.28 0 1.14 1.14 0 0 1 2.28 0zm8 0a1.14 1.14 0 1 1-2.28 0 1.14 1.14 0 0 1 2.28 0zm3.5-4.86H7.36V7.36h17.28v17.28zm4.86-3.5a1.14 1.14 0 1 1 0-2.28 1.14 1.14 0 0 1 0 2.28z" />
            </svg>
            Models
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-5 w-5"
            >
              <path d="m16 6 4 14" />
              <path d="M12 6v14" />
              <path d="M8 8v12" />
              <path d="M4 4v16" />
            </svg>
            Metrics
          </Button>
        </div>
      </div>
    </div>
  );
}
