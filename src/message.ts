// eslint-disable-next-line import-helpers/order-imports
import { many } from './utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const EmailJS = require('emailjs');

export class EmailMessage extends EmailJS.Message {
  readonly templateName: string;
  readonly to: readonly string[];
  readonly html: string;

  constructor({
    templateName,
    html,
    ...headers
  }: Partial<any> & { templateName: string; html: string }) {
    super(headers);
    this.templateName = templateName;
    this.to = headers.to ? many(headers.to) : [];
    this.html = html;
  }

  read(callback?: (err: Error | undefined, buffer: string) => void) {
    return new Promise<string>((resolve, reject) => {
      super.read((err: Error | undefined, buffer: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        err ? reject(err) : resolve(buffer);
        callback?.(err, buffer);
      });
    });
  }
}
