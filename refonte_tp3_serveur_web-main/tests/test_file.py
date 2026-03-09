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
import sys
from os.path import dirname, join

from myserver.file import resolve_location, resolve_path, get_resource


def _find_root():
    """
    A utility to return the path of the script for test resources.
    """
    tests_dir = dirname(__file__)
    return tests_dir


def test_resolve_path():
    """
    Tests the resolve_path() function with some normal use cases.
    """
    tests_path = _find_root()
    res_path = join(tests_path, 'resources', 'www')

    # Normal resource.
    full_path = resolve_path(res='/index.html', root=res_path)
    print(full_path)
    assert full_path.endswith('resources/www/index.html')

    # Let's try with a folder in resource, with an image.
    full_path = resolve_path(res='/images/chaton.jpg', root=res_path)
    print(full_path)
    assert full_path.endswith('resources/www/images/chaton.jpg')


def test_resolve_path_weirdos():
    """
    Tests the resolve_path() function with some abnormal use cases.
    """
    tests_path = _find_root()
    res_path = join(tests_path, 'resources', 'www')

    # //index.html should be the same as /index.html.
    full_path = resolve_path(res='//index.html', root=res_path)
    print(full_path)
    assert full_path.endswith('resources/www/index.html')

    # / should return /index.html path
    full_path = resolve_path(res='/', root=res_path)
    print(full_path)
    assert full_path.endswith('resources/www/index.html')

    # Non-existing resources should return the empty string ''.
    full_path = resolve_path(res='/index.dontexist', root=res_path)
    print(full_path)
    assert full_path == ''

    
def test_get_resource():
    """
    Tests the get_resource() function by checking the content of the returned file.
    """
    tests_path = _find_root()
    res_path = join(tests_path, 'resources', 'www', 'index.html')
    out = get_resource(res_path=res_path)
    print(out)
    assert out[0] == b'<!DOCTYPE html>\n<html>\n<body>\n\n<h1>My First Heading</h1>\n<p>My first paragraph. See https://www.w3schools.com/html/html_basic.asp</p>\n\n</body>\n</html> '

def test_get_resource_image():
    """
    Tests the get_resource() function by checking the content of an image.

    For an image, check we get the magic numbers for a JPEG.
    See https://gist.github.com/leommoore/f9e57ba2aa4bf197ebc5 for a complete list.
    """
    tests_path = _find_root()
    res_path = join(tests_path, 'resources', 'www', 'images', 'chaton.jpg')
    out = get_resource(res_path=res_path)
    assert out[0][:4] == b'\xff\xd8\xff\xe0'

    
