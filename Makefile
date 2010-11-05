
test:
	@./support/expresso/bin/expresso \
		-I lib \
		test/*.test.js

test-server:
	@node test/server.js

benchmark:
	@node benchmarks/run.js

.PHONY: test test-server benchmark