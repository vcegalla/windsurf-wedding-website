const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RSVP_TABLE_NAME;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const lastName = event.queryStringParameters?.lastName;
    const name = event.queryStringParameters?.name;

    if (!lastName && !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing lastName or name parameter' }),
      };
    }

    const params = lastName
      ? {
          TableName: TABLE_NAME,
          IndexName: 'LastNameIndex',
          KeyConditionExpression: '#lastName = :lastName',
          ExpressionAttributeNames: {
            '#lastName': 'lastName',
          },
          ExpressionAttributeValues: {
            ':lastName': lastName.trim().toLowerCase(),
          },
          ScanIndexForward: false,
          Limit: 1,
        }
      : {
          TableName: TABLE_NAME,
          IndexName: 'NameIndex',
          KeyConditionExpression: '#name = :name',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
          ExpressionAttributeValues: {
            ':name': name,
          },
          ScanIndexForward: false,
          Limit: 1,
        };

    const result = await dynamoDB.query(params).promise();

    if (result.Items && result.Items.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: result.Items[0] }),
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'RSVP not found' }),
      };
    }

  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
