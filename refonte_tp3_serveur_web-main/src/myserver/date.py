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
A package for learning network programming in Python.

This module (file) manages date related-utilities.
"""

from time import gmtime, strftime

_RFC2616_DATE_FORMAT = '%a, %d %b %Y %H:%M:%S GMT'

def now_rfc2616():
    return strftime(_RFC2616_DATE_FORMAT, gmtime())

