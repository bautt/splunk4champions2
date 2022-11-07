#!/usr/bin/env python

import datetime 
import time 
import urllib.request
import os 

print(os.environ['SPLUNK_HOME'])
start = time.time()
url = 'https://github.com/bautt/splunk4champions/raw/master/splunk4champions/static/current.log.gz'
target = '/opt/splunk/etc/apps/splunk4champions2/static/current.log.gz'
#target = '../static/current.log.gz'
#target = '$SPLUNK_HOME/etc/apps/splunk4champions2/static/current.log.gz'

d = urllib.request.urlopen(url)
# print(d.info())
content_length = (d.info()['Content-Length'])
#urllib.request.urlretrieve(url, target)


dauer = ('{0:0.1f}'.format(time.time() - start))
now = datetime.datetime.now()
datum = (now.strftime("%Y-%m-%d %H:%M:%S"))
message2=(" Splunk4Champions2 download script for weather data was finished in ")
print(datum +  message2 + str(dauer) + ' seconds. The size of the file was ' + str(content_length) + ' Bytes online')


