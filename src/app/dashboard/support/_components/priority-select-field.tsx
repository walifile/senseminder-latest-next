import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
}

const PrioritySelectField = ({ value, setValue, disabled = false }: Props) => {
  return (
    <Select value={value} onValueChange={setValue} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">Low</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="high">High</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PrioritySelectField;
