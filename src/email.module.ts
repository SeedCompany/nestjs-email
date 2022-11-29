import { SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { DynamicModule, Module, Type } from '@nestjs/common';
import {
  EMAIL_MODULE_OPTIONS,
  EmailModuleOptions,
  EmailOptions,
  SES_TOKEN,
} from './email.options';
import { EmailService } from './email.service';
import { MaybeAsync } from './utils';

export interface EmailOptionsFactory {
  createEmailOptions: () => MaybeAsync<EmailModuleOptions>;
}

export interface EmailModuleAsyncOptions
  extends Pick<DynamicModule, 'imports' | 'global'> {
  useExisting?: Type<EmailOptionsFactory>;
  useClass?: Type<EmailOptionsFactory>;
  useFactory?: (...args: any[]) => MaybeAsync<EmailModuleOptions>;
  inject?: any[];
}

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {
  static forRoot(
    options: EmailModuleOptions & Pick<DynamicModule, 'global'>,
  ): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS,
          useValue: resolveOptions(options),
        },
        {
          provide: SES_TOKEN,
          useValue: sesFromOptions(options),
        },
      ],
      global: options.global,
    };
  }

  static forRootAsync(options: EmailModuleAsyncOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: options.imports,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS,
          ...(options.useFactory
            ? {
                useFactory: async (...args: any[]) =>
                  resolveOptions(await options.useFactory!(...args)),
                inject: options.inject || [],
              }
            : {
                useFactory: async (optionsFactory: EmailOptionsFactory) =>
                  resolveOptions(await optionsFactory.createEmailOptions()),
                inject: [options.useExisting || options.useClass!],
              }),
        },
        ...(options.useExisting || options.useFactory
          ? []
          : [{ provide: options.useClass!, useClass: options.useClass! }]),
        {
          provide: SES_TOKEN,
          useFactory: sesFromOptions,
          inject: [EMAIL_MODULE_OPTIONS],
        },
      ],
      global: options.global,
    };
  }
}

const resolveOptions = (options: EmailModuleOptions): EmailOptions => ({
  open: false,
  send: false,
  wrappers: [],
  replyTo: [],
  ...options,
});

const sesFromOptions = (options: EmailModuleOptions) =>
  options.ses instanceof SES
    ? options.ses
    : new SES({
        region: 'us-east-1',
        ...options.ses,
      });
