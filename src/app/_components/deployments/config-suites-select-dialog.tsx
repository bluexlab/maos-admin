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

export default function ConfigSuitesSelectDialog({
  open,
  availableSuites,
  selectedSuites,
  selectedDeploymentIds,
  onSelected,
  onOpenChange,
}: {
  open: boolean;
  availableSuites: string[];
  selectedSuites: string[];
  selectedDeploymentIds: number[];
  onOpenChange: (open: boolean) => void;
  onSelected: (selected: string[], deployments: number[]) => void;
}) {
  const [selected, setSelected] = useState(selectedSuites);
  const [addedDeploymentIds, setAddedDeploymentIds] = useState<number[]>(selectedDeploymentIds);
  const [openAddDeployment, setOpenAddDeployment] = useState(false);
  const [search, setSearch] = useState("");
  const { data: deployments, isLoading } = api.deployments.list.useQuery({
    name: search,
  });
  const availableDeployments = deployments?.data?.filter(
    (d) => !addedDeploymentIds.find((a) => a === d.id),
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
          {addedDeploymentIds.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox
                id={`checkbox_d_${id}`}
                checked={true}
                onClick={() => setAddedDeploymentIds(addedDeploymentIds.filter((a) => a !== id))}
              />
              <Label htmlFor={`checkbox_d_${id}`}>
                {deployments?.data?.find((d) => d.id === id)?.name}
              </Label>
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
                            setAddedDeploymentIds([...addedDeploymentIds, d.id]);
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
              onSelected(selected, addedDeploymentIds);
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
