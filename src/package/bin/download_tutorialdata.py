
#!/usr/bin/env python3

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
url = 'https://docs.splunk.com/images/Tutorial/tutorialdata.zip'
target = (splunkhome + '/etc/apps/splunk4champions2/static/tutorialdata.zip')

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
req = urllib.request.Request(url, headers=headers)

# getting size info and downloading in one request
d = urllib.request.urlopen(req)
content_length = (d.info()['Content-Length'])

with open(target, 'wb') as f:
    f.write(d.read())


dauer = ('{0:0.1f}'.format(time.time() - start))
now = datetime.datetime.now()
datum = (now.strftime("%Y-%m-%d %H:%M:%S"))
message2=(" tb Splunk4Champions2 download script for Splunk tutorial data. This should only be triggered at Splunk restart ")
print(datum + message2 + str(dauer) + ' seconds. The size of the file was ' + str(content_length) + ' Bytes online')
#print(mydir)
#print(splunkhome)
#print(path.parent)
#print(target)