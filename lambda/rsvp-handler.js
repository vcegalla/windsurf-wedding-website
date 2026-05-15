const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.RSVP_TABLE_NAME;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
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
    const body = JSON.parse(event.body);
    const { name, attending, guests, dietary, message } = body;

    // Validate input
    if (!name || typeof attending !== 'boolean') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: name and attending' }),
      };
    }

    const timestamp = new Date().toISOString();
    const rsvpId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const item = {
      rsvpId,
      name,
      attending,
      guests: attending ? (guests || 1) : 0,
      dietary: dietary || '',
      message: message || '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await dynamoDB.put(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'RSVP submitted successfully',
        rsvpId,
        data: item,
      }),
    };

  } catch (error) {
    console.error('Error processing RSVP:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
