import { SESv2Client as SES, SESv2ClientConfig } from '@aws-sdk/client-sesv2';
import { ReactElement } from 'react';
import { Many } from './utils';

export const SES_TOKEN = Symbol('SES');

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailModuleOptions {
  from: string;
  open?: boolean;
  send?: boolean;
  replyTo?: Many<string>;
  wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
  ses?: SES | SESv2ClientConfig;
}

export type EmailOptions = Required<Readonly<Omit<EmailModuleOptions, 'ses'>>>;
