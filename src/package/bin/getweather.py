#!/usr/bin/env python3
# coding=utf-8

import glob
import os
import sys
import gzip

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from splunklib.searchcommands import Configuration, GeneratingCommand, dispatch


@Configuration()
class GetWeatherCommand(GeneratingCommand):
    """
    Streams weather event data from the bundled static file(s) into the search
    pipeline. Use with collect to reload data into the index.

    Example:

    ``| getweather | collect index=s4c_weather sourcetype=s4c:weather``
    """

    def generate(self):
        static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
        pattern = os.path.join(static_dir, 'current*.log.gz')
        files = sorted(glob.glob(pattern))

        if not files:
            self.error_exit(
                None,
                'getweather: no files matching current*.log.gz found in {}'.format(static_dir)
            )
            return

        for data_file in files:
            try:
                with gzip.open(data_file, 'rt', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        yield {'_raw': line.rstrip('\n')}
            except Exception as e:
                self.error_exit(
                    e,
                    'getweather: failed to read {}: {}'.format(data_file, e)
                )
                return


dispatch(GetWeatherCommand, sys.argv, sys.stdin, sys.stdout, __name__)
