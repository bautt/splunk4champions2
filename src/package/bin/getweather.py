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
import os, sys
import time

import requests
import tarfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from splunklib.searchcommands import dispatch, GeneratingCommand, Configuration, Option, validators
from splunklib.six.moves import range


@Configuration()
class GeneratingCSC(GeneratingCommand):
    """
    The generatingcsc command generates a specific number of records.

    Example:

    ``| generatingcsc count=4``

    Returns a 4 records having text 'Test Event'.
    """

    def generate(self):
        link='https://github.com/bautt/splunk4champions2/raw/main/src/package/static/current.log.gz'
        with requests.get(link, stream=True) as rx, tarfile.open(fileobj=rx.raw, mode="r:gz") as tarobj:
            for entry in tarobj:
               fileobj=tarobj.extractfile(entry)
               for line in fileobj:
                   yield { '_raw': line.decode('utf-8') }


dispatch(GeneratingCSC, sys.argv, sys.stdin, sys.stdout, __name__)