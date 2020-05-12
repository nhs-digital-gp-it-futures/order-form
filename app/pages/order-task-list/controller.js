import { getContext } from './contextCreator';

export const getNewOrderPageContext = () => getContext({ orderId: 'neworder' });

/*
export const getExistingOrderPageContext = ({ orderId }) => {
  make api call to get order summary 6736 dependent json contract 

  Request -> 

  GET  /api/v1/orders/{orderId}/summary

  Response ->

  {
    "orderId": "C0000014-01",
    "organisationId": "ID",
    "description": "Hello",
    "lastUpdatedBy": "Bob Smith",
    "lastUpdated": "2020-05-06T09:29:52.4965647Z",
    "dateCreated": "2020-05-06T09:29:52.4965647Z",
    "sections": [
      {
        "id" : "description",      
        "status": "complete"
      },
    ]
  }

  get organisationId and description

  return getContext({ orderId, organisationId, description });
}
*/
