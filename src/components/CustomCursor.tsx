
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateCursorPointer = () => {
      const target = document.elementFromPoint(position.x, position.y) as HTMLElement;
      if (target) {
        const computedStyle = window.getComputedStyle(target);
        setIsPointer(
          computedStyle.getPropertyValue("cursor") === "pointer" ||
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.classList.contains("cursor-pointer")
        );
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    document.addEventListener("mousemove", updateCursorPosition);
    document.addEventListener("mousemove", updateCursorPointer);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", updateCursorPosition);
      document.removeEventListener("mousemove", updateCursorPointer);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [position.x, position.y]);

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
        animate={{
          x: position.x,
          y: position.y,
          opacity: isHidden ? 0 : 1,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          damping: 20,
          mass: 0.2,
          stiffness: 200,
        }}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full"
          animate={{
            width: isPointer ? 50 : 20,
            height: isPointer ? 50 : 20,
            opacity: 0.8,
          }}
          transition={{
            duration: 0.2,
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
