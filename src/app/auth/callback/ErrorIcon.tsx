import Image from "next/image";

export default function ErrorIcon() {
  return (
    <Image
      src="/assets/svg/close.svg"
      alt="Error"
      width={50}
      height={36}
    />
  );
}
