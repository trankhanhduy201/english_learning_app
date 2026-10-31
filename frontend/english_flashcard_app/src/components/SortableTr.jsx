import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableTr = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined, // Fix the x-axis movement
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          // Apply listeners only to the first cell (or any specific cell)
          return React.cloneElement(child, { ...listeners });
        }
        return child;
      })}
    </tr>
  );
};
