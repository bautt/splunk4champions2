#!/usr/bin/env python

import datetime 
import time 
import urllib.request
import os 
from pathlib import Path

splunkhome = (os.environ['SPLUNK_HOME'])
#mydir = '{PWD}'.format(**os.environ)
#path = Path(Path.cwd())
#parent = path.parent
start = time.time()
url = 'https://github.com/bautt/splunk4champions/raw/master/splunk4champions/static/current.log.gz'
target = (splunkhome + '/etc/apps/splunk4champions2/static/current.log.gz')

# getting size info from the file
d = urllib.request.urlopen(url)
# print(d.info())
content_length = (d.info()['Content-Length'])

# this is downloading 
urllib.request.urlretrieve(url, target)


dauer = ('{0:0.1f}'.format(time.time() - start))
now = datetime.datetime.now()
datum = (now.strftime("%Y-%m-%d %H:%M:%S"))
message2=(" Splunk4Champions2 download script for weather data was finished in ")
print(datum + message2 + str(dauer) + ' seconds. The size of the file was ' + str(content_length) + ' Bytes online')
#print(mydir)
#print(splunkhome)
#print(path.parent)
#print(target)