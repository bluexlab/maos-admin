"use client";

import { JsonView, allExpanded, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function DeploymentLogs({ logs }: { logs: Record<string, unknown> }) {
  return (
    <Accordion type="single" collapsible>
      {Object.entries(logs).map(([key, value]) => (
        <AccordionItem value={key} key={key}>
          <AccordionTrigger>{key}</AccordionTrigger>
          <AccordionContent>
            <JsonView data={value as object} shouldExpandNode={allExpanded} style={darkStyles} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
