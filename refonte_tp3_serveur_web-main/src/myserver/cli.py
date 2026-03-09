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

This module (file) manages the command line interface to control the server.
"""

import argparse
import sys 
from myserver.context_server import Server,Context

def parse_args(argv: list[str]) -> argparse.Namespace:
    """
    Parses arguments from command line.
    
    Parameters
    ----------
    - argv: list[str]
        The list of arguments to parse.

    Returns
    -------
    argparse.Namespace
        The list of parameters and their values.

    """
    parser = argparse.ArgumentParser(
        prog="myserver", 
        description="My HTTP web server")
    parser.add_argument('-p', '--port',  
                        help='TCP port number to listen to',
                        default=8080, type=int,
                        required=True)
    parser.add_argument('-r', '--root',  
                        help='Root directory of the server',
                        type=str, required=True)
    args = parser.parse_args(argv)
    return args

def main():
    args = parse_args(sys.argv[1:])
    serveur = Server(args.port,args.root)
    context = Context()
    context.addModule("server",serveur)
    context.runCtx()