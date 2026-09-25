import { util } from '@aws-appsync/utils';

// Published ContentMeta for one topic / subcat1 / subcat2 key, newest first.
const INDEXES = {
  topic:        'contentMetasByTopicAndDate',
  topicSubcat1: 'contentMetasByTopicSubcat1AndDate',
  topicSubcat2: 'contentMetasByTopicSubcat2AndDate',
};

export function request(ctx) {
  const { field, value, limit, nextToken } = ctx.args;
  const index = INDEXES[field];
  if (!index) util.error(`Unsupported field: ${field}`, 'BadRequest');

  const req = {
    operation: 'Query',
    index,
    query: {
      expression: '#key = :value',
      expressionNames: { '#key': field },
      expressionValues: util.dynamodb.toMapValues({ ':value': value }),
    },
    filter: {
      expression: '#published = :true',
      expressionNames: { '#published': 'isPublished' },
      expressionValues: util.dynamodb.toMapValues({ ':true': true }),
    },
    scanIndexForward: false,
    limit: limit ? Math.min(limit, 100) : 10,
  };
  if (nextToken) req.nextToken = nextToken;
  return req;
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return { items: ctx.result.items, nextToken: ctx.result.nextToken || null };
}
