node_modules: package.json package-lock.json
	npm i
	touch $@

router:
	curl -sSL https://router.apollo.dev/download/nix/latest | sh

run: node_modules router
	node s1 & node s2 & node s3 &
	npx rover supergraph compose --config supergraph.yaml > schema.gql
	./router --supergraph schema.gql

.PHONY: run
