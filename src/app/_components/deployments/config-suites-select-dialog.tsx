import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { api } from "~/trpc/react";

type Deployment = {
  id: number;
  name: string;
};

export default function ConfigSuitesSelectDialog({
  open,
  availableSuites,
  selectedSuites,
  onSelected,
  onOpenChange,
}: {
  open: boolean;
  availableSuites: string[];
  selectedSuites: string[];
  onOpenChange: (open: boolean) => void;
  onSelected: (selected: string[], deployments: number[]) => void;
}) {
  const [selected, setSelected] = useState(selectedSuites);
  const [addedDeployments, setAddedDeployments] = useState<Deployment[]>([]);
  const [openAddDeployment, setOpenAddDeployment] = useState(false);
  const [search, setSearch] = useState("");
  const { data: deployments, isLoading } = api.deployments.list.useQuery({
    name: search,
  });
  const availableDeployments = deployments?.data?.filter(
    (d) => !addedDeployments.find((a) => a.id === d.id),
  );

  useEffect(() => {
    setSelected(selectedSuites);
  }, [selectedSuites]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Config Suites</DialogTitle>
          <DialogDescription>Select the config suites to compare.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {availableSuites.map((suite, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                id={`checkbox_${index}`}
                checked={selected.includes(suite)}
                onClick={() =>
                  selected.includes(suite)
                    ? setSelected(selected.filter((s) => s !== suite))
                    : setSelected([...selected, suite])
                }
              />
              <Label htmlFor={`checkbox_${index}`}>{suite}</Label>
            </div>
          ))}
          {addedDeployments.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Checkbox
                id={`checkbox_d_${d.id}`}
                checked={true}
                onClick={() => setAddedDeployments(addedDeployments.filter((a) => a.id !== d.id))}
              />
              <Label htmlFor={`checkbox_d_${d.id}`}>{d.name}</Label>
            </div>
          ))}

          <Popover open={openAddDeployment} onOpenChange={setOpenAddDeployment}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[360px] justify-between"
              >
                Search deployments...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search deployments..."
                  onValueChange={(search) => setSearch(search)}
                />
                <CommandList>
                  <CommandEmpty>No item found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <CommandItem>Loading...</CommandItem>
                    ) : (
                      availableDeployments?.map((d) => (
                        <CommandItem
                          key={d.id}
                          onSelect={() => {
                            setOpenAddDeployment(false);
                            setAddedDeployments([...addedDeployments, d]);
                          }}
                        >
                          {d.name} <p className="hidden">{d.id}</p>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button type="button" className="w-40" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="w-40"
            onClick={() => {
              onSelected(
                selected,
                addedDeployments.map((d) => d.id),
              );
              onOpenChange(false);
            }}
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
