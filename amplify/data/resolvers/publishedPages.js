import { util } from '@aws-appsync/utils';

// Every non-draft Page, optionally limited to slugs starting with `prefix`.
// The Page table is small (< 100 rows), so a filtered scan is fine.
export function request(ctx) {
  const prefix = ctx.args.prefix;
  let expression = '(attribute_not_exists(#status) OR #status <> :draft)';
  const expressionNames = { '#status': 'status' };
  const values = { ':draft': 'draft' };
  if (prefix) {
    expression += ' AND begins_with(#slug, :prefix)';
    expressionNames['#slug'] = 'slug';
    values[':prefix'] = prefix;
  }
  return {
    operation: 'Scan',
    filter: { expression, expressionNames, expressionValues: util.dynamodb.toMapValues(values) },
  };
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type);
  return ctx.result.items;
}
