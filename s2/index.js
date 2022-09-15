const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const express = require('express');
const http = require('node:http');

const schema = gql`
type Brand @key(fields: "id name type") @key(fields: "id") {
  id: String!
  name: String!
  market: String!
  type: String!
}

type Query {
  brands: [Brand]
}
`;

const resolver = {
  Brand: {
    __resolveReference: (reference) => {
      return {
        id: reference,
        name: 'cool name',
        type: 'type',
      };
    }
  },
  Query: {
    brands: () => ([
      { id: '1', name: 'a', type: 'ttt' },
      { id: '2', name: 'b', type: 'ttt' },
    ])
  }
}

const federatedSchema = buildSubgraphSchema([{ typeDefs: schema, resolvers: resolver }]);

(async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: federatedSchema,
    playground: true,
  });
  await server.start();
  server.applyMiddleware({ app })

  await new Promise(resolve => httpServer.listen({ port: 4011 }, resolve));
})();
