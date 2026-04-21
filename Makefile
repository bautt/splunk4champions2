.PHONY: dev

deps:
	cd src/ && yarn install

package:
	echo "not implemented yet"

dev:
	cd src/web && yarn build --watch

build:
	cd src/ && NODE_ENV=production yarn build

package: build
	rm -rf /tmp/splunk4champions2
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

deploy:
	scp splunk4champions2.tar.gz tbaublys@v37823.1blu.de:~
	ssh tbaublys@v37823.1blu.de "\
		cd /opt/splunk/etc/apps && \
		sudo tar xzf ~/splunk4champions2.tar.gz && \
		sudo chown -R splunk:splunk /opt/splunk/etc/apps/splunk4champions2 && \
		sudo systemctl restart Splunkd && \
		echo done"

deploy_show:
	cp splunk4champions2.tar.gz /opt/code/s4cshow/
	s4cshow.sh

appinspect:
	venv/bin/splunk-appinspect inspect splunk4champions2.tar.gz