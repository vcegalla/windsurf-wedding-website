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
    const { lastName, people } = body;

    if (!lastName || !Array.isArray(people) || people.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: lastName and people' }),
      };
    }

    const timestamp = new Date().toISOString();
    const normalizedLastName = lastName.trim().toLowerCase();
    const rsvpId = `${normalizedLastName.replace(/\s+/g, '-')}-${Date.now()}`;

    const item = {
      rsvpId,
      lastName: normalizedLastName,
      people: people.map((person) => ({
        name: person.name,
        ceremonyAttending: Boolean(person.ceremonyAttending),
        receptionAttending: Boolean(person.receptionAttending),
        dietary: person.dietary || '',
      })),
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
