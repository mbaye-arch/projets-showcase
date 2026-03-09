######################################################################
# Copyright (c) Adrien Luxey-Bitri, Boris Baldassari
#
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0
######################################################################

"""
Script to test the myserver module.
"""

import pytest
import io
from contextlib import redirect_stdout

from myserver.log import log, log_address, log_request, log_reply


def test_log():
    """
    Tests the log() function by capturing stdout.
    """
    f = io.StringIO()
    with redirect_stdout(f):
        log('test message')
    out = f.getvalue()
    print(out)
    assert out.endswith(' - test message\n')

    
def test_log_address():
    """
    Tests the log_address() function by capturing stdout.
    """
    f = io.StringIO()
    with redirect_stdout(f):
        log_address(('0.0.0.0', 12345), 'test message')
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - test message\n')


def test_log_request():
    """
    Tests the log_request() function by capturing stdout.
    """
    req = {
        'head': {
            'verb': 'GET',
            'resource': '/index.html'
            }
    }
    f = io.StringIO()
    with redirect_stdout(f):
        log_request(('0.0.0.0', 12345), req)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - GET /index.html\n')

def test_log_request_useragent():
    """
    Tests the log_request() function by capturing stdout.
    """
    req = {
        'head': {
            'verb': 'GET',
            'resource': '/index.html'
        },
        'params': {
            'User-Agent': 'MyTest UserAgent v1.23'
        }
    }
    f = io.StringIO()
    with redirect_stdout(f):
        log_request(('0.0.0.0', 12345), req)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - GET /index.html - MyTest UserAgent v1.23\n')

def test_log_request_failed_assert():
    """
    Tests if the log_request() function properly fails when wrong
    parameters are provided.
    """
    req = {
        'head': {
            'verb': 'GET',
            }
    }
    with pytest.raises(AssertionError) as e_info:
        log_request(('0.0.0.0', 12345), req)
    
    req = {
        'whatever': {
            'verb': 'GET',
            'resource': '/index.html'
            }
    }
    with pytest.raises(AssertionError) as e_info:
        log_request(('0.0.0.0', 12345), req)
    
def test_log_reply():
    """
    Tests the log_reply() function by checking its output.
    """
    req = {
        'head': {
            'verb': 'GET',
            'resource': '/index.html'
            }
    }
    f = io.StringIO()
    with redirect_stdout(f):
        log_reply(('0.0.0.0', 12345), req, 200)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - GET /index.html - 200\n')

    # Check a different status code.
    with redirect_stdout(f):
        log_reply(('0.0.0.0', 12345), req, 403)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - GET /index.html - 403\n')
    
def test_log_reply_useragent():
    """
    Tests the log_reply() function by checking its output.
    """
    req = {
        'head': {
            'verb': 'GET',
            'resource': '/index.html'
            },
        'params': {
            'User-Agent': 'MyTest UserAgent v1.23'
        }
    }
    f = io.StringIO()
    with redirect_stdout(f):
        log_reply(('0.0.0.0', 12345), req, 200)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 0.0.0.0:12345 - GET /index.html - 200 - MyTest UserAgent v1.23\n')

    with redirect_stdout(f):
        log_reply(('127.0.0.1', 12345), req, 502)
    out = f.getvalue()
    print(out)
    assert out.endswith(' - 127.0.0.1:12345 - GET /index.html - 502 - MyTest UserAgent v1.23\n')

