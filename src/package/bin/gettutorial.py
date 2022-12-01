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

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import os
import sys
from zipfile import ZipFile
import time

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from splunklib.searchcommands import (Configuration, GeneratingCommand, Option,
                                      dispatch, validators)
from splunklib.six.moves import range


@Configuration()
class GeneratingCSC(GeneratingCommand):
    """
    The gettutorial command downloads example tutorial data and extracts it in to the search. 
    Use |collect to save it in to an index. 

    Example:

    ``| getweather | collect index=main ``

    """
    def generate(self):

        link='https://docs.splunk.com/images/Tutorial/tutorialdata.zip'
        with requests.get(link, stream=True, verify=False) as rx,  ZipFile(rx, 'r') as zObject:
            zObject.extractall()    
            #for entry in zObject:
             #  fileobj=zObject.extractall(entry)
              # for line in fileobj:
               #    yield { '_raw': line.decode('utf-8') }


dispatch(GeneratingCSC, sys.argv, sys.stdin, sys.stdout, __name__)