#!/usr/bin/env python

import time
import random
import tarfile
import os
from datetime import datetime

splunkhome = (os.environ['SPLUNK_HOME'])
start = time.time()

def get_last_5000_lines_from_tgz(tgz_file_path, log_file_name):
    with tarfile.open(tgz_file_path, 'r:gz') as tar:
        log_file = tar.extractfile(log_file_name)
        lines = log_file.readlines()
    return [line.decode('utf-8').strip() for line in lines[-5000:]]

def replace_timestamp(line):
    current_time = datetime.now().strftime('%d/%b/%Y %H:%M:%S')
    parts = line.split(' ')
    parts[3] = f'[{current_time}'
    return ' '.join(parts)

def delete_output_file(output_file):
    os.remove(output_file)

def append_log_lines(tgz_file_path, log_file_name, output_file):
    last_5000_lines = get_last_5000_lines_from_tgz(tgz_file_path, log_file_name)
    
    f = open(output_file, 'a')
    try:
        while True:
            random.shuffle(last_5000_lines)
            for line in last_5000_lines:
                new_line = replace_timestamp(line)
                f.write(new_line + '\n')
                f.flush()
                
                # Delete the log file if it exceeds 10 MB
                if os.path.getsize(output_file) > 10 * 1024 * 1024:  # 10 MB
                    f.close()
                    delete_output_file(output_file)
                    f = open(output_file, 'a')
                
                time.sleep(1)
    finally:
        f.close()

if __name__ == "__main__":
    tgz_file_path = (splunkhome + '/etc/apps/splunk4champions2/static/www1.tgz')  
    log_file_name = 'www1.log'
    output_file = (splunkhome + '/etc/apps/splunk4champions2/static/www.log') 

    append_log_lines(tgz_file_path, log_file_name, output_file)
datum = (now.strftime("%Y-%m-%d %H:%M:%S"))
message=(" tb Splunk4Champions2 live update www data script was started. it will write up to 10MB and delete ")
print(datum + message)