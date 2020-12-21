import { MjmlTitle } from 'mjml-react';
import * as React from 'react';
import { createContext, useContext } from 'react';

interface SubjectContextType {
  subject?: string;
}

const SubjectContext = createContext<SubjectContextType>({});

export class SubjectCollector {
  private context?: SubjectContextType;

  collect(children: React.ReactNode) {
    this.context = {};
    return (
      <SubjectContext.Provider value={this.context}>
        {children}
      </SubjectContext.Provider>
    );
  }

  get subject(): string {
    if (!this.context?.subject) {
      throw new Error(
        '<Title> must be used to provide a subject for the email'
      );
    }
    return this.context.subject;
  }
}

/**
 * Wrap mjml title to also make the title the email's subject
 */
export const Title = ({ children }: { children: string }) => {
  const context = useContext(SubjectContext);
  context.subject = children;
  return <MjmlTitle>{children}</MjmlTitle>;
};
