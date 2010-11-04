
test:
	@./support/expresso/bin/expresso \
		-I lib \
		test/*.test.js

benchmark:
	@node examples/benchmark.js

.PHONY: test benchmark