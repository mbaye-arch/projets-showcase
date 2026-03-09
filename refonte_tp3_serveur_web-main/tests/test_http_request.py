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
Script to test the server.py module.
"""

import pytest 

from myserver.http_request import parse_request, parse_request_params, \
    parse_request_head

def _compare_dicts(a: dict, b:dict, nested=False):
    """
    Utility to compare two arrays, optionally with recursion.
    """
    assert len(a) == len(b)
    for k in a.keys():
        assert k in b
        if nested and type(a[k]) is dict and type(b[k]) is dict:
            _compare_dicts(a[k], b[k], nested=False)
        else:
            assert a[k] == b[k]


############### Request header ###############

testdata_request_head = [
    (
        'GET / HTTP/1.1',
        {'verb': 'GET', 'resource': '/'}
    ),
    (
        'options /assets/style.css HTTP/1.1', 
        {'verb': 'OPTIONS', 'resource': '/assets/style.css'}
    )
]
@pytest.mark.parametrize("head, expected", testdata_request_head)
def test_parse_request_head(head: str, expected: dict):
    output = parse_request_head(head)
    _compare_dicts(output, expected)

def test_parse_request_head_invalid():
    with pytest.raises(ValueError):
        _ = parse_request_head('Saaaaaluuuut')


############### Request params ###############

testdata_request_params = [
    ([], {}),
    (
        [
            "Host: example.org",
            "User-Agent: curl/7.81.0",
            "Accept: */*"
        ],
        {
            "Host": "example.org",
            "User-Agent": "curl/7.81.0",
            "Accept": "*/*"
        }
    ),
    (
        [
            "           Host: example.org           ",
            "Accept-Encoding: gzip, deflate, br"
        ],
        {
            "Host": "example.org",
            "Accept-Encoding": "gzip, deflate, br"
        }
    )
]
@pytest.mark.parametrize("params, expected", testdata_request_params)
def test_parse_request_params(params: list[str], expected: dict):
    output = parse_request_params(params)
    _compare_dicts(output, expected)

testdata_request_params_invalid = [
    ["Host example.org"],
    [": example.org"],
    ["Truc: "]
]
@pytest.mark.parametrize("params", testdata_request_params_invalid)
def test_parse_request_params_invalid(params: list[str]):
    with pytest.raises(ValueError):
        _ = parse_request_params(params)


############### Full request ###############

testdata_request = [
    (
        b"""GET /index.html HTTP/1.1
Host: example.org
User-Agent: curl/7.81.0
Accept: */*

""",
        {
            "head": {"verb": "GET", "resource": "/index.html"},
            "params": {
                "Host": "example.org",
                "User-Agent": "curl/7.81.0",
                "Accept": "*/*"
            }
        }
    ),
    (b"""

OPTIONS /assets/style.css HTTP/1.1

""", 
        {
            "head": {"verb": "OPTIONS", "resource": "/assets/style.css"},
            "params": {}
        }
     )
]
@pytest.mark.parametrize("buf, expected", testdata_request)
def test_parse_request(buf: bytes, expected: dict):
    output = parse_request(buf)
    _compare_dicts(output, expected, nested=True)

testdata_request_invalid = [
    b"""Host: example.org
User-Agent: curl/7.81.0

""",
    b"""
GET HTTP/1.1

""",
    b"""GET / HTTP/1.1
Host example.org

"""
    b"""GET / HTTP/1.1
Host: example.org

User-Agent: curl/7.81.0

"""
]
@pytest.mark.parametrize("buf", testdata_request_invalid)
def test_parse_request_invalid(buf: bytes):
    with pytest.raises(ValueError):
        _ = parse_request(buf)

