
ADDON = build/Release/canvas.node

$(ADDON): src/*.cc
	npm install

test: $(ADDON)
	@./node_modules/.bin/mocha test/*.test.js

test-server: $(ADDON)
	@node test/server.js

benchmark:
	@node benchmarks/run.js

clean:
	rm -fr build

.PHONY: test test-server benchmark clean
