import { util, runtime } from '@aws-appsync/utils';

// Step 2: read the body row for the metaId stashed by publishedBodyMeta.js.
// No metaId means the item is missing, a draft, or the wrong topic.
export function request(ctx) {
  if (!ctx.stash.metaId) runtime.earlyReturn(null);
  const index = ctx.info.fieldName === 'publishedPublicBody'
    ? 'publicContentBodiesByMetaId'
    : 'protectedContentBodiesByMetaId';
  return {
    operation: 'Query',
    index,
    query: {
      expression: '#metaId = :metaId',
      expressionNames: { '#metaId': 'metaId' },
      expressionValues: util.dynamodb.toMapValues({ ':metaId': ctx.stash.metaId }),
    },
    limit: 1,
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  const body = ctx.result.items[0];
  if (!body) return null;
  return { body: body.body, s3Key: body.s3Key, fileKey: body.fileKey };
}
