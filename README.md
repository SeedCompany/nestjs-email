# @SeedCompany/nestjs-email

A [NestJS](https://nestjs.com/) library to generate emails via JSX and send them via AWS SES

# How it works

The rendering is powered by [mjml](https://mjml.io/) with a [React](https://reactjs.org/)
[wrapper](https://github.com/wix-incubator/mjml-react).  
This allows email templates & components to be created in a typesafe way while having the
complexities of email HTML handled by mjml.

The generated HTML runs through [html-to-text](https://github.com/html-to-text/node-html-to-text)
to automatically create a text version of the email.  
Where needed, this ouput can be customized with our `<InText>` and `<HideInText>` components.

After that a MIME message is composed via [emailjs](http://github.com/eleith/emailjs.git).  
This merges the HTML, text, attachments, & headers (from, to, etc.) to a string.

With the MIME message finalized it is sent to [SES](https://aws.amazon.com/ses/) via their
[v3 SDK](https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-sesv2).  
Their SDK allows for automatic configuration; compared to SMTP which
needs to be configured with an explicit server, username, and password.

All of this is wrapped in an [NestJS](https://nestjs.com/) module for easy integration.

There's also an `open` option to open rendered HTML in browser, which can be useful for development.

# Setup

### Simple static
```ts
EmailModule.forRoot({
  from: 'dev@foo.com', // "Dev <dev@foo.com>" format also works
  send: true, // Actually send email. It's assumed this is not always wanted aka dev.
  global: true, // Optionally allow EmailService to be used globally without importing module
})
```

See [EmailModuleOptions](src/email.options.ts#L9-L16) for all options.

## Async Configuration
More complex setups can use async configuration (standard to NestJS packages)

### Factory function example
```ts
EmailModule.forRootAsync({
  useFactory: async (foo: FooService) => ({
    from: await foo.getFromAddress(),
  }),
  import: [FooService],
})
```
### Options class example
```ts
EmailModule.forRootAsync({
  useClass: EmailConfig,
  // or
  useExisting: EmailConfig,
})
```
```ts
@Injectable()
export class EmailConfig implements EmailOptionsFactory {
  async createEmailOptions() {
    return {
      from: '',
    };
  }
}
```

# Usage

## Define a template

```tsx
import * as Mjml from '@seedcompany/nestjs-email/templates';
import { Mjml as MjmlRoot } from 'mjml-react';

export function ForgotPassword({ name, url }: { name: string, url: string }) {
  return (
    <MjmlRoot lang="en">
      <Mjml.Head>
        {/* Title also sets the subject */}
        <Mjml.Title>Forgot Password</Mjml.Title>
      </Mjml.Head>
      <Mjml.Body>

        <Mjml.Section>
          <Mjml.Column padding={0}>
            <Mjml.Text fontSize={24}>
              Hey {name}, passwords are hard
            </Mjml.Text>
          </Mjml.Column>
        </Mjml.Section>

        <Mjml.Section>
          <Mjml.Column>
            <Mjml.Text>
              If you requested this, confirm the password change
            </Mjml.Text>
            <Mjml.Button href={url}>CONFIRM</Mjml.Button>
          </Mjml.Column>
        </Mjml.Section>

      </Mjml.Body>
    </MjmlRoot>
  );
}
```

This is a single component to show the complete picture. In actual usage
it makes more sense to break this up into smaller components, just like
would be done with React UIs.  

For example, an `<Email>` wrapping component could be created to wrap
`Mjml` root, `Head`, `Body`, setup theme, etc.  

A `<Heading>` component could turn the first section into a one liner.



## Call it

```ts
import { Injectable } from '@nestjs/common';
import { EmailService } from '@seedcompany/nestjs-email';
import { ForgotPassword } from './forgot-password.template';

@Injectable()
export class UserService {
  constructor(private email: EmailService) {}

  async forgotPassword(emailAddress: string) {
    const user = await lookupByEmail(emailAddress);

    await this.email.send(user.email, ForgotPassword, {
      // type safe parameters per template
      name: user.name,
      url: 'https://foo.com/signed-url/...',
    });
  }
}
```
