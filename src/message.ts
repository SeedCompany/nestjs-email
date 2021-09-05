import { Message, MessageHeaders } from 'emailjs';
import { many } from './utils';

export class EmailMessage extends Message {
  readonly templateName: string;
  readonly to: readonly string[];
  readonly html: string;

  constructor({
    templateName,
    html,
    ...headers
  }: Partial<MessageHeaders> & { templateName: string; html: string }) {
    super(headers);
    this.templateName = templateName;
    this.to = headers.to ? many(headers.to) : [];
    this.html = html;
  }
}
