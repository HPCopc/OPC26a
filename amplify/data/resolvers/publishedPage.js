import { util } from '@aws-appsync/utils';

// One Page by slug; drafts come back as null.
export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ slug: ctx.args.slug }),
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  const page = ctx.result;
  if (!page || page.status === 'draft') return null;
  return page;
}
