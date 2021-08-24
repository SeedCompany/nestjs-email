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

  read(callback?: (err: Error, buffer: string) => void) {
    return new Promise<string>((resolve, reject) => {
      super.read((err, buffer) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        err ? reject(err) : resolve(buffer);
        callback?.(err, buffer);
      });
    });
  }
}
