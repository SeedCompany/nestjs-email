import { SendEmailCommand, SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { convert as htmlToText } from 'html-to-text';
import * as textFormatters from 'html-to-text/lib/formatter';
import { render } from 'mjml-react';
import * as openUrl from 'open';
import { createElement, ReactElement } from 'react';
import { file as tempFile } from 'tempy';
import { EMAIL_MODULE_OPTIONS, EmailOptions, SES_TOKEN } from './email.options';
import { RenderForText } from './templates/text-rendering';
import { SubjectCollector } from './templates/title';
import { Many, many, sleep } from './utils';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(SES_TOKEN) private readonly ses: SES,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions
  ) {}

  async send<P>(
    to: Many<string>,
    template: (props: P) => ReactElement,
    props: P
  ): Promise<void> {
    const tos = many(to).join(', ');
    this.logger.debug(`Sending ${template.name} email to ${tos}`);

    const { send, open } = this.options;

    const docEl = this.options.wrappers.reduceRight(
      (prev: ReactElement, wrap) => wrap(prev),
      createElement(template, props)
    );

    const { html, subject } = this.renderHtml(docEl);
    const text = this.renderText(docEl);

    if (send) {
      await this.sesSend(to, subject, html, text);
      this.logger.debug(`Sent ${template.name} email to ${tos}`);
      return;
    }

    this.logger.debug(
      `Would have sent ${template.name} email if enabled to ${tos}`
    );

    if (open) {
      await this.openEmail(html);
    }
  }

  private async sesSend(
    to: Many<string>,
    subject: string,
    html: string,
    text: string
  ) {
    const { from, replyTo } = this.options;
    const utf8 = (data: string) => ({ Data: data, Charset: 'UTF-8' });
    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: {
        ToAddresses: many(to).slice(),
      },
      ReplyToAddresses: many(replyTo).slice(),
      Content: {
        Simple: {
          Subject: utf8(subject),
          Body: { Html: utf8(html), Text: utf8(text) },
        },
      },
    });
    try {
      await this.ses.send(command);
    } catch (e) {
      this.logger.error('Failed to send email', e.stack);
      throw e;
    }
  }

  private renderHtml(templateEl: ReactElement) {
    const collector = new SubjectCollector();

    const { html } = render(collector.collect(templateEl));
    return { html, subject: collector.subject };
  }

  private renderText(templateEl: ReactElement) {
    const { html: htmlForText } = render(
      createElement(RenderForText, null, templateEl)
    );

    const text = htmlToText(htmlForText, {
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      ],
      formatters: {
        // mjml uses `role="presentation"` for non-table tables, skip those.
        // actual tables get rendered as normal.
        table: (el, walk, builder, options) =>
          el.attribs.role === 'presentation'
            ? walk(el.children, builder)
            : textFormatters.dataTable(el, walk, builder, options),
      },
    });

    return text;
  }

  private async openEmail(html: string) {
    const temp = tempFile({ extension: 'html' });
    await fs.writeFile(temp, html);
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting temp file
    void sleep(10_000)
      .then(() => fs.unlink(temp))
      .catch();
  }
}
