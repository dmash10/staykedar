import { createContext, useContext, useState, ReactNode } from "react";

interface SimpleEditContextProps {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

const SimpleEditContext = createContext<SimpleEditContextProps | undefined>(undefined);

export const SimpleEditProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <SimpleEditContext.Provider value={{ isEditMode, setIsEditMode }}>
      {children}
    </SimpleEditContext.Provider>
  );
};

export const useSimpleEdit = () => {
  const context = useContext(SimpleEditContext);
  if (context === undefined) {
    throw new Error("useSimpleEdit must be used within a SimpleEditProvider");
  }
  return context;
}; 