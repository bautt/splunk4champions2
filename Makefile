.PHONY: dev

deps:
	cd src/ && yarn install

package:
	echo "not implemented yet"

dev:
	cd src/web && yarn build --watch

build:
	cd src/web && yarn build

package: build
	cp -r dist/ /tmp/splunk4champions2
	COPYFILE_DISABLE=1 tar \
	--exclude='.DS_Store' \
	--exclude='.gitkeep' \
	--exclude='local.meta' \
	--exclude='__pycache__' \
	--exclude='./splunk4champions2/local' \
	--exclude='*.pyc' \
	-cvzf splunk4champions2.tar.gz \
	-C /tmp \
	splunk4champions2/

appinspect:
	venv/bin/splunk-appinspect inspect splunk4champions2.tar.gz