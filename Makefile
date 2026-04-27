.PHONY: dev fetch-current-log package deploy deploy_show appinspect

deps:
	cd src/ && yarn install

dev:
	cd src/web && yarn build --watch

build:
	rm -rf dist
	cd src/ && NODE_ENV=production yarn build

# Optional: SKIP_FETCH_CURRENT=1 — merge local only (no ssh to v37823).
# Invoked from deploy_show (not package) so normal `make package` stays offline-safe.
fetch-current-log:
	@if [ "x$${SKIP_FETCH_CURRENT}" = "x1" ]; then \
		echo "SKIP_FETCH_CURRENT=1: ingest local only (merge legacy into current_2026, no ssh)"; \
		python3 ./scripts/ingest_v37823_current.py --no-fetch; \
	else \
		python3 ./scripts/ingest_v37823_current.py; \
	fi

package: build
	rm -rf /tmp/splunk4champions2
	cp -r dist/ /tmp/splunk4champions2
	COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar \
	--format=ustar \
	--no-xattrs \
	--exclude='.DS_Store' \
	--exclude='.gitkeep' \
	--exclude='local.meta' \
	--exclude='__pycache__' \
	--exclude='./splunk4champions2/local' \
	--exclude='*.pyc' \
	-cvzf splunk4champions2.tar.gz \
	-C /tmp \
	splunk4champions2/

deploy:
	scp splunk4champions2.tar.gz tbaublys@v37823.1blu.de:~
	ssh tbaublys@v37823.1blu.de "\
		cd /opt/splunk/etc/apps && \
		sudo tar xzf ~/splunk4champions2.tar.gz && \
		sudo chown -R splunk:splunk /opt/splunk/etc/apps/splunk4champions2 && \
		sudo systemctl restart Splunkd && \
		echo done"

deploy_show: fetch-current-log package
	cp splunk4champions2.tar.gz /opt/code/s4cshow/
	s4cshow.sh

appinspect:
	venv/bin/splunk-appinspect inspect splunk4champions2.tar.gz