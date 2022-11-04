#!/usr/bin/env python3
from datetime import datetime
import urllib.request

url = 'https://github.com/bautt/splunk4champions/raw/master/splunk4champions/static/current.log.gz'
#urllib.request.urlretrieve(url, '../static/current.tar.gz')
now = datetime.now()

message=(" Splunk4Champions download script for weather data was started")
dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
print(dt_string + message)