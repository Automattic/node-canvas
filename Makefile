
ADDON = build/default/canvas.node

$(ADDON): src/*.cc
	node-waf configure build \
	  && ln -s $@ index.node

test: $(ADDON)
	@./support/expresso/bin/expresso \
		-I lib \
		test/*.test.js

test-server: $(ADDON)
	@node test/server.js

benchmark:
	@node benchmarks/run.js

clean:
	node-waf distclean
	rm -f index.node

.PHONY: test test-server benchmark clean