import { promisify } from 'util';
import { resolve } from 'dns';

const dnsResolveP = promisify(resolve);

export const handler = async () => {
  const results = await dnsResolveP('https://glastonbury.seetickets.com');
  const date = new Date();
  return {
    statusCode: 200,
    body: {
      results,
      dateAdded: date.toLocaleString(),
      dateUpdated: date.toLocaleString(),
    },
  };
};

// https://stackoverflow.com/questions/59888917/dynamodb-how-to-update-an-item-except-for-one-attribute-if-the-attribute-alread

// UpdateItemCommand

// const input = {
//   "ExpressionAttributeNames": {
//     "#AT": "AlbumTitle",
//     "#Y": "Year"
//   },
//   "ExpressionAttributeValues": {
//     ":t": {
//       "S": "Louder Than Ever"
//     },
//     ":y": {
//       "N": "2015"
//     }
//   },
//   "Key": {
//     "Artist": {
//       "S": "Acme Band"
//     },
//     "SongTitle": {
//       "S": "Happy Day"
//     }
//   },
//   "ReturnValues": "ALL_NEW",
//   "TableName": "Music",
//   "UpdateExpression": "SET #Y = :y, #AT = :t"
// };

// SET if_not_exists(date_created, :right_now), other_field_1 = :value_1, other_field_2 = :value_2
