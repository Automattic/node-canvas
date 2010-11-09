
test:
	@./support/expresso/bin/expresso \
		-I lib \
		test/*.test.js

test-server:
	@node test/server.js

benchmark:
	@node benchmarks/run.js

clean:
	node-waf distclean

.PHONY: test test-server benchmark clean