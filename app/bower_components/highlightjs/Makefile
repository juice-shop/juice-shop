VERSION=8.0

default: highlight
		@cp -f highlight/build/highlight.* .
		@cp -f highlight/src/styles/* styles
		@du -bh highlight.*

highlight:
		@git clone git://github.com/isagalaev/highlight.js.git $@
		@cd highlight && git pull && git checkout $(VERSION) && cd ..
		# The master version requires "python3"
		@python highlight/tools/build.py

.PHONY: default
