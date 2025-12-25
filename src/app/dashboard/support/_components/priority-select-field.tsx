import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

interface Props {
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
}

const PrioritySelectField = ({ value, setValue, disabled = false }: Props) => (
  <Select value={value} onValueChange={setValue} disabled={disabled}>
  <SelectTrigger
    data-testid="support-priority-dropdown"
    variant="form"
    className="h-auto rounded-[10px] px-5 py-4"
  >
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>

    <SelectContent>
      <SelectItem value="low">Low</SelectItem>
      <SelectItem value="medium">Medium</SelectItem>
      <SelectItem value="high">High</SelectItem>
    </SelectContent>
  </Select>
);

export default PrioritySelectField;
