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

This module (file) manages the parsing of HTTP requests.
"""


def parse_request(buf: bytes) -> dict[str, dict]:
    """Parses a full HTTP request bytes buffer into a dict. 

    The parsed request dict contains two keys:
    - head: dict[str, str]
        Information on the HTTP request header (i.e. the first request line);
        output of `parse_request_head`.
    - params: dict[str, str]
        List of the HTTP parameters (i.e. the following lines); 
        output of `parse_request_params`.
        
    An example of return:
    ```
    {
        'head': { 'verb': 'GET', 'resource': '//index.html'}, 
        'params': {
            'Host': 'localhost:8000', 
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0', 
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8', 
            'Accept-Language': 'en-GB,en;q=0.5', 
            'Accept-Encoding': 'gzip, deflate, br',
            [SNIP]
        }
    }
    ```

    Parameters
    ----------
    - buf: bytes 
        The HTTP request buffer.

    Returns
    -------
    dict[str, dict]
        The parsed content of the HTTP request.

    Raises
    ------
    ValueError
        The request is not valid HTTP.
    """
    #verifiation buff non vide
    if buf == b'':
        raise ValueError("Received empty request")
    #decodage de buf en utf-8
    buf_str = buf.decode('utf-8')
    #decoupage de buf en liste de ligne avec suppresseur de retour a la ligne   
    lines = buf_str.strip().splitlines()
    #appel des fonctions parse_request_head et parse_request_params
    req_head = parse_request_head(lines[0])
    req_params = parse_request_params(lines[1:])
    return dict(
        head=req_head,
        params=req_params
    )

def parse_request_head(line: str) -> dict[str, str]:
    """Parses a HTTP request header string (its first line) into a dict.

    The parsed request dict contains two keys:
    - verb: str
        The _uppercase_ verb of the request, i.e. the first word of the line;
        for example: "GET".
    - resource: str
        The requested resource, i.e. the second "word" of the line;
        for example: "/index.html".
    Parameters
    ----------
    - line: str
        The HTTP request header (the first line of a full HTTP request)
    Returns
    -------
    dict[str, str]
        The parsed content of the HTTP request header.
    Raises
    ------
    ValueError
        The request header is not valid HTTP.
    """
    res =dict()
    # decoupage de line en liste 
    liste = line.split(" ")
    #verifiation taille de liste egale a 3
    if len(liste)==3:
        #verication de la presence de get et  / dans la ressource
        if liste[0].upper() == "GET":
            res["verb"] = "GET"
            res["resource"] = liste[1]
        #verication de la presence de options et  resources dans la ressource
        elif liste[0].upper() == "OPTIONS":
            res["verb"] = "OPTIONS"
            res["resource"] = liste[1]
        else:
            #si le verbe n'est pas get ou options
            raise ValueError(f"Request header is invalid: {line}")
    else:
        #si la taille de la liste est differente de 3
        raise ValueError(f"Request header is invalid: {line}")
    return res

def parse_request_params(lines: list[str]) -> dict[str, str]:
    """Parses HTTP request parameters (a list of lines) into a dict.

    The parsed request dict contains one key/value pair per line, with the 
    dict key being the left part of the line (the parameter key), and the 
    dict value being the right part of the line (the parameter value).

    The function strips leading and trailing spaces: " Host: a.org  " becomes
    `{"Host": "a.org"}`.
        
    Parameters
    ----------
    - lines: list[str]
        HTTP parameters (one list item per line)

    Returns
    -------
    dict[str, str]
        Dictionary of the parameters
            
    Raises
    ------
    ValueError
        The provided lines are not valid HTTP.
    """
    params = dict()
    #parcours de la liste de ligne
    for line in lines:
        #decoupage de la ligne en liste avec separateur ": "
        liste = line.split(": ")
        #verifiation de la taille de la liste
        if len(liste)==2 and liste[0] and liste[1]:
            #ajout de la cle et de la valeur dans le dictionnaire
            params[liste[0].strip()] = liste[1].strip()
        else:
            #si la taille de la liste est differente de 2
         raise ValueError(f"Request line is not a valid key/value pair: {lines}")
    return params


