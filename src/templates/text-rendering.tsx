import { createContext, ReactNode, useContext } from 'react';

interface ChildrenProp {
  children: ReactNode;
}

const RenderForTextContext = createContext(false);

/**
 * Hook for whether we are rendering for text.
 */
export const inText = () => useContext(RenderForTextContext);

/**
 * Hide the children of this element when converting to text.
 */
export const HideInText = ({ children }: ChildrenProp) =>
  inText() ? null : <>{children}</>;

/**
 * Only show the children of this element when converting to text.
 */
export const InText = ({ children }: ChildrenProp) =>
  inText() ? <>{children}</> : null;

export const RenderForText = ({
  value,
  children,
}: { value?: boolean } & ChildrenProp) => (
  <RenderForTextContext.Provider value={value ?? true}>
    {children}
  </RenderForTextContext.Provider>
);
