import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;

function getUserId(event) {
  // API Gateway HTTP API with Cognito JWT authorizer forwards JWT in requestContext.authorizer.jwt.claims
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  const sub = claims?.sub;
  if (!sub) throw new Error('Unauthorized');
  return sub;
}

export const list = async (event) => {
  const userId = getUserId(event);
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: { ':u': userId }
  }));
  return { statusCode: 200, body: JSON.stringify(out.Items || []) };
};

export const create = async (event) => {
  const userId = getUserId(event);
  const body = JSON.parse(event.body || '{}');
  const now = new Date().toISOString();
  const item = {
    userId,
    id: ulid(),
    title: body.title,
    sourceURL: body.sourceURL || null,
    ingredients: body.ingredients || [],
    steps: body.steps || [],
    tags: body.tags || [],
    imageKey: body.imageKey || null,
    createdAt: now,
    updatedAt: now
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return { statusCode: 201, body: JSON.stringify(item) };
};

export const get = async (event) => {
  const userId = getUserId(event);
  const { id } = event.pathParameters || {};
  const out = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId, id } }));
  if (!out.Item) return { statusCode: 404, body: 'Not found' };
  return { statusCode: 200, body: JSON.stringify(out.Item) };
};

export const update = async (event) => {
  const userId = getUserId(event);
  const { id } = event.pathParameters || {};
  const body = JSON.parse(event.body || '{}');
  const updates = [];
  const names = {};
  const values = {};
  const fields = ['title','sourceURL','ingredients','steps','tags','imageKey'];
  for (const f of fields) {
    if (f in body) { updates.push(`#${f} = :${f}`); names['#'+f] = f; values[':'+f] = body[f]; }
  }
  updates.push('#updatedAt = :updatedAt'); names['#updatedAt'] = 'updatedAt'; values[':updatedAt'] = new Date().toISOString();
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId, id },
    UpdateExpression: 'SET ' + updates.join(', '),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values
  }));
  const out = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId, id } }));
  return { statusCode: 200, body: JSON.stringify(out.Item) };
};

export const remove = async (event) => {
  const userId = getUserId(event);
  const { id } = event.pathParameters || {};
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { userId, id } }));
  return { statusCode: 204, body: '' };
};
