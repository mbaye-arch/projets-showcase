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

This module (file) manages the HTTP logging messages.
"""

from myserver.date import now_rfc2616


def log(msg: str):
    """
    Logs a message to stdout, with a timestamp.
    
    Output is: `timestamp - message`.
    
    Parameters
    ----------
    - msg : str 
        The message string to print.
    """
    print(f"{now_rfc2616()} - {msg}")


def log_address(addr: tuple[str, int], msg: str):
    """
    Logs a message to stdout, with a timestamp and an address (host:port).
    
    Output is: `timestamp - host:port - message`.
    
    Parameters
    ----------
    - addr: tuple[str, int]
        The address to print, as a tuple (host, port)
    - msg: str
        The message string to print.
    """
    # Get the host and port from the address
    host, port = addr  
    # Print the message with the timestamp, host, port
    print(f"{now_rfc2616()} - {host}:{port} - {msg}")
    

def log_request(addr: tuple[str, int], req: dict[str, dict]):
    """
    Logs a request message to stdout, with a timestamp and an address (host:port).
    If the User-Agent header is passed, its value is appended at the end.
    
    Output is: `timestamp - host:port - verb resource`.

    Output with User-Agent is: `timestamp - host:port - verb resource - user_agent`.

    Parameters
    ----------
    - addr: tuple[str, int]
        The address to print, as a tuple (host, port)
    - req: dict[str, dict]
        The request to print.
    """
    user_agent=None
    resource=None
    verb=None
    #verb
    
    #resource
    try:
        verb=req['head']['verb']
        resource = req['head']['resource']
    except KeyError:
        raise AssertionError("Resource not found in request")
    # Get the host and port from the address
    host, port = addr
    # Get the User-Agent header from the request
    if len(req)>1:
        user_agent = req['params']['User-Agent']
    # Create the message to print
    timestamp=now_rfc2616()
    if user_agent is None:
        print(f"{timestamp} - {host}:{port} - {verb} {resource}")
    else:
        print(f"{timestamp} - {host}:{port} - {verb} {resource} - {user_agent}")
    

def log_reply(addr: tuple[str, int], req: dict[str, dict], code: int):
    """
    Logs an HTTP reply to stdout, with timestamp, address (host:port), code.
    If the User-Agent header is passed, its value is appended at the end.
    
    Output is: `timestamp - host:port - HTTP-verb HTTP-resource - code`.

    Output with User-Agent is: `timestamp - host:port - HTTP-verb HTTP-resource - code - user_agent`.

    Parameters
    ----------
    - addr: tuple[str, int]
        The address to print, as a tuple (host, port)
    - req: dict[str, dict]
        The request to print.
    - code: int
        The replied code to print.
    """
    user_agent=None
    verb=None
    resource=None
    #timestamp
    timestamp = now_rfc2616()
    # Get the host and port
    host, port = addr
    # Get the verb and resource from the request
    if req and 'head' in req:
        verb = req['head']['verb']
        resource = req['head']['resource']
    # Get the User-Agent header from the request
    if req and len(req)>1:
        user_agent = req['params'].get('User-Agent', None)
    # Create the message to print
    if user_agent is None:
        print(f"{timestamp} - {host}:{port} - {verb} {resource} - {code}")
    else:
        print(f"{timestamp} - {host}:{port} - {verb} {resource} - {code} - {user_agent}")


