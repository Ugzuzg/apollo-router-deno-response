const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const express = require('express');
const http = require('node:http');

const schema = gql`
type Microvawe @key(fields: "id") {
  id: String!
  brand: Brand
}

extend type Brand @key(fields: "id name type") {
  id: String! @external
  name: String! @external
  type: String! @external
  market: String!
}

type Query {
  microvawes: [Microvawe]
}
`;

const resolver = {
  Microvawe: {
    __resolveReference: (reference) => {
      return {
        id: reference,
      };
    },
  },
  Brand: {
    microvawes: (brand) => {
      return [{ id: 1 }, { id: 2 }];
    }
  },
  Query: {
    microvawes: () => ([
      { id: '1' },
      { id: '2' },
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

  await new Promise(resolve => httpServer.listen({ port: 4010 }, resolve));
})();
