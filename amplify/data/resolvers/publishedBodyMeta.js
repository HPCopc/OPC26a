import { util } from '@aws-appsync/utils';

// Step 1 of publishedPublicBody / publishedProtectedBody: find the published
// ContentMeta for the slug and check its topic matches the body table being
// read, then stash its id for step 2.
const PUBLIC_TOPICS = ['events', 'resources'];

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
  const meta = ctx.result.items[0];
  if (!meta) return null;

  const isPublicTopic = PUBLIC_TOPICS.indexOf(meta.topic) !== -1;
  const wantsPublic = ctx.info.fieldName === 'publishedPublicBody';
  if (isPublicTopic === wantsPublic) ctx.stash.metaId = meta.id;
  return null;
}
