import { SES } from 'aws-sdk';
import { ReactElement } from 'react';
import { Many } from './utils';

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailModuleOptions {
  from: string;
  open?: boolean;
  send?: boolean;
  replyTo?: Many<string>;
  wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
  ses?: SES | SES.Types.ClientConfiguration;
}

export type EmailOptions = Required<Readonly<Omit<EmailModuleOptions, 'ses'>>>;
