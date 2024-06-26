
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

url = 'https://raw.github.com/bautt/s4cshow/master/www1.tgz'
target = (splunkhome + '/etc/apps/splunk4champions2/static/www1.tgz')

# getting size info from the file
d = urllib.request.urlopen(url)
# print(d.info())
content_length = (d.info()['Content-Length'])

# this is downloading 
urllib.request.urlretrieve(url, target)


dauer = ('{0:0.1f}'.format(time.time() - start))
now = datetime.datetime.now()
datum = (now.strftime("%Y-%m-%d %H:%M:%S"))
message2=(" tb Splunk4Champions2 download script for WWW data was finished in ")
print(datum + message2 + str(dauer) + ' seconds. The size of the file was ' + str(content_length) + ' Bytes online')
