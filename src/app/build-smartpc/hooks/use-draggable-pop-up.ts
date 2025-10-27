import { useEffect, useRef } from "react";

export function useDraggablePopup(open: boolean) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const animationFrame = useRef<number | null>(null);

  // === Mouse Handlers ===
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!popupRef.current) return;
    isDragging.current = true;
    offset.current = {
      x: e.clientX - pos.current.x,
      y: e.clientY - pos.current.y,
    };
    popupRef.current.style.transition = "none";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    pos.current = { x: newX, y: newY };

    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      if (popupRef.current) {
        popupRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    });
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (popupRef.current)
      popupRef.current.style.transition = "transform 0.2s ease-out";
    document.body.style.userSelect = "auto";
  };

  // === Listeners ===
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // === Reset on close ===
  useEffect(() => {
    if (!open && popupRef.current) {
      popupRef.current.style.transform = "";
      pos.current = { x: 0, y: 0 };
    }
  }, [open]);

  return { popupRef, handleMouseDown, isDragging };
}
