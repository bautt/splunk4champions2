#!/usr/bin/env python
# coding=utf-8
#
# Copyright © 2011-2015 Splunk, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License"): you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

from __future__ import absolute_import, division, print_function, unicode_literals

import gzip
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from splunklib.searchcommands import Configuration, GeneratingCommand, dispatch


@Configuration()
class GetWeatherCommand(GeneratingCommand):
    """
    Streams weather event data from the bundled static file into the search
    pipeline. Use with collect to load data into an index.

    Example:

    ``| getweather | collect index=s4c_weather sourcetype=s4c_weather``
    """

    def generate(self):
        splunkhome = os.environ.get('SPLUNK_HOME', '')
        data_file = os.path.join(splunkhome, 'etc', 'apps', 'splunk4champions2', 'static', 'current_2026.log.gz')
        try:
            with gzip.open(data_file, 'rt', encoding='utf-8', errors='replace') as f:
                for line in f:
                    yield {'_raw': line.rstrip('\n')}
        except Exception as e:
            yield {'_raw': 'getweather error: ' + str(e)}


dispatch(GetWeatherCommand, sys.argv, sys.stdin, sys.stdout, __name__)