
test:
	@./support/expresso/bin/expresso \
		-I lib

benchmark:
	@node examples/benchmark.js

.PHONY: test benchmark