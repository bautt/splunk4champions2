from datetime import datetime, timedelta
from pytz import utc, timezone
from time import mktime
import urllib.request
datenow = datetime.now()
delta = timedelta(days=-1825) #"5.x" years
datestart = datenow + delta
tsstart = mktime(utc.localize(datestart).utctimetuple())
tsend = mktime(utc.localize(datenow).utctimetuple())
link = "https://query1.finance.yahoo.com/v7/finance/download/%5EGDAXI?period1={tsstart:.0f}&period2={tsend:.0f}&interval=1d&events=history&includeAdjustedClose=true".format(tsstart=tsstart,tsend=tsend )
#urllib.request.urlretrieve(link, "{tsstart:.0f}_gdax_download.csv".format(tsstart=tsstart))
urllib.request.urlretrieve(link, "gdax_download.csv".format(tsstart=tsstart))
print(link)
