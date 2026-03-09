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
from os.path import dirname, join

from myserver.server import serve, handle_client, prepare_resource, prepare_reply


def _find_root():
    """
    A utility to return the path of the script for test resources.
    """
    tests_dir = dirname(__file__)
    return tests_dir


def test_handle_client():
    """
    Tests the handle_client() function by using the requests module.
    """

    pass


def test_prepare_resource():
    """
    Tests the prepare_resource() function by using the requests module.
    """
    # Identify the resources directory to serve.
    tests_path = _find_root()
    path = join(tests_path, 'resources', 'www')
    request = {
        'head': {
            'verb': 'GET',
            'resource': '/index.html'
        },
        'params': {
            'User-Agent': 'MyTest UserAgent v1.23'
        }
    }
    reply, code = prepare_resource(root=path, req=request)
    assert code == 200
    reply = reply.decode()
    print(reply)
    assert reply.startswith('HTTP/1.0 200 OK\nContent-Type: text/html\nDate: ')
    assert reply.endswith('See https://www.w3schools.com/html/html_basic.asp</p>\n\n</body>\n</html> ')


testdata_reply = [
    ('index.html', 200,
     'HTTP/1.0 200 OK\nContent-Type: text/html\nDate: ',
     'See https://www.w3schools.com/html/html_basic.asp</p>\n\n</body>\n</html> '),
    ('styles.css', 200,
     'HTTP/1.0 200 OK\nContent-Type: text/html\nDate: ',
     'p {\n  color: "DarkSlateGray";\n  text-align: left;\n} \n'), 
    ('script.js', 200,
     'HTTP/1.0 200 OK\nContent-Type: text/html\nDate: ',
     '"Paragraph changed.";\n}\n'), 
]
@pytest.mark.parametrize("file_name, code_expected, start, end", testdata_reply)
def test_prepare_reply(file_name: str, code_expected: int, start: str, end: str):
    """
    Tests the prepare_resource() function by using the requests module.
    """
    # Identify the resources directory to serve.
    tests_path = _find_root()
    file_path = join(tests_path, 'resources', 'www', file_name)
    with open(file_path, 'rb') as f:
        file_content = f.read()
    
    reply, code = prepare_reply(content=file_content, content_type='text/html', code=200)
    assert code == code_expected
    reply = reply.decode()
    print(reply)
    assert reply.startswith(start)
    assert reply.endswith(end)

    
testdata_reply_images = [
    ('chaton.jpg', 200),
    ('starred.png', 200), 
    ('debian-swirl.svg', 200), 
]
@pytest.mark.parametrize("file_name, code_expected", testdata_reply_images)
def test_prepare_reply_image(file_name: str, code_expected: int):
    """
    Tests the prepare_resource() function by using the requests module.
    """
    # Identify the resources directory to serve.
    tests_path = _find_root()
    file_path = join(tests_path, 'resources', 'www', 'images', file_name)
    with open(file_path, 'rb') as f:
        file_content = f.read()

    if file_name.endswith('.png'):
        image_type = 'image/jpeg'
    elif file_name.endswith('.png'):
        image_type = 'image/png'
    elif file_name.endswith('.svg'):
        image_type = 'image/svg+xml'
    else:
        image_type = 'application/octet-stream'
        
    reply, code = prepare_reply(content=file_content, content_type=image_type, code=200)
    
    assert code == code_expected
    assert reply.startswith(b'HTTP/1.0 200 OK\nContent-Type: ')
    assert reply.endswith(file_content)
