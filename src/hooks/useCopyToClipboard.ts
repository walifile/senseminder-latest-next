import { useCallback, useState } from "react";

export const useCopyToClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  return { copyToClipboard, isCopying };
};
