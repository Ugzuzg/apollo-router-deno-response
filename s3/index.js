const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const express = require('express');
const http = require('node:http');

const schema = gql`
type Contact @key(fields: "id") {
  id: String!
  brand: Brand
}

type Brand @key(fields: "id") @extends {
  id: String! @external
  name: String! @external
  market: String! @external
  type: String! @external
  contacts: [Contact]
    @requires(
      fields: "name type"
    )
}
`;

const resolver = {
  Contact: {
    __resolveReference: (reference) => {
      return {
        id: reference,
      };
    },
  },
  Brand: {
    contacts: (brand) => {
      return [{ id: 1 }, { id: 2 }];
    }
  },
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

  await new Promise(resolve => httpServer.listen({ port: 4012 }, resolve));
})();
