import React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";

type GradientSearchInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  icon?: React.ReactNode;
  inputTestId?: string;
};

const GradientSearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  id = "search",
  name = "search",
  wrapperClassName,
  inputClassName,
  iconClassName,
  icon,
  inputTestId,
}: GradientSearchInputProps) => (
  <div className={cn("relative w-full max-w-md min-w-0 sm:min-w-[200px]", wrapperClassName)}>
    <div className="bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)] rounded-[1000px] border-[none] relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[1000px] before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <span className="absolute h-10 w-10 top-1/2 left-1.5 -translate-y-1/2 p-2 rounded-[23px] border border-solid border-[#ced1fc] dark:border-[rgba(255,255,255,0.10)] bg-blue-700/10 dark:bg-[rgba(255,255,255,0.03)] text-[#2530F0] dark:text-white">
        {icon || <Search className={cn("h-full w-full", iconClassName)} />}
      </span>
      <Input
        id={id}
        name={name}
        placeholder={placeholder}
        className={cn(
          "pl-14 h-14 md:text-base rounded-full bg-blue-700/5 dark:bg-[rgba(255,255,255,0.03)] text-black placeholder:text-[#454545] dark:text-[#B8C2D5]",
          inputClassName
        )}
        onChange={onChange}
        value={value}
        data-testid={inputTestId}
      />
    </div>
  </div>
);

export default GradientSearchInput;
