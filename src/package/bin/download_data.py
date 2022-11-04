#!/usr/bin/env python3

import urllib.request
url = 'https://github.com/bautt/splunk4champions/raw/master/splunk4champions/static/current.log.gz'
urllib.request.urlretrieve(url, '../static/current.tar.gz')