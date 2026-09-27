import { util } from '@aws-appsync/utils';

// Every published HomeBox. The table holds a few dozen rows at most, so a
// filtered scan is fine; the page sorts them into columns.
export function request() {
  return {
    operation: 'Scan',
    limit: 1000,
    filter: {
      expression: 'attribute_not_exists(#published) OR #published = :true',
      expressionNames: { '#published': 'isPublished' },
      expressionValues: util.dynamodb.toMapValues({ ':true': true }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return ctx.result.items;
}
