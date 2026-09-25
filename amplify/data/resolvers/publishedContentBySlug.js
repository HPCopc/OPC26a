import { util } from '@aws-appsync/utils';

// One published ContentMeta by slug; null if missing or a draft.
export function request(ctx) {
  return {
    operation: 'Query',
    index: 'contentMetasBySlug',
    query: {
      expression: '#slug = :slug',
      expressionNames: { '#slug': 'slug' },
      expressionValues: util.dynamodb.toMapValues({ ':slug': ctx.args.slug }),
    },
    filter: {
      expression: '#published = :true',
      expressionNames: { '#published': 'isPublished' },
      expressionValues: util.dynamodb.toMapValues({ ':true': true }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return ctx.result.items[0] || null;
}
