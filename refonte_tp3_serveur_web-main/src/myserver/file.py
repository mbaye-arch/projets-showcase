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

This module (file) manages operations relative to the file system.
"""

import os
from pathlib import Path

def resolve_location(res:str, root: str):
    """Returns the path of a resource relative to the root and its extension.

    Returns ("", "") if the concatenated path does not exist.

    "index.html" is appended to directory paths.

    Parameters
    ----------
    res: str 
        The queried resource path.
    root: str 
        The root directory where to look into for res.

    Returns
    -------
    str
        The full disk path of the resource if it exists, or "".
    str
        The extension of the resource if it exists, or "".
    """
    #initialision de l'extension et du chemin
    extension=""
    res_path=resolve_path(res,root)
    #verification que le chemin n'est pas chaine vide 
    if res_path != "":
        #on prend l'extension
        extension =os.path.splitext(res_path)[1]
        extension=extension.lstrip('.')
        # et on retourne le couple 
        return res_path,extension
    #sinon on retourne vide vide 
    return res_path,extension
    
    
def resolve_path(res:str, root: str):
    """Returns the full disk path of a resource relative to the root.

    Beware that resources in a request start with a leading '/'.
    If the request points to a directory, then append "index.html" to
    the path.

    Returns "" if the concatenated path does not exist.

    Parameters
    ----------
    res: str 
        The queried resource path.
    root: str 
        The root directory where to look into for res.

    Returns
    -------
    str
        The full disk path of the resource if it exists, or "".
    """
    res = res.lstrip('/')
    chemin = Path(root)/res
    # si le chemin est un fichier on retourne le chemin
    if chemin.is_file():
        return str(chemin)
    #sinon si c'est un dossier on retourne le chemin du fichier index.html
    elif chemin.is_dir():
        index = chemin / "index.html"
        if index.is_file():
            return str(index)
        # Ne retourne pas de HTML ici, mais juste le chemin du répertoire
        return str(chemin) 
    #sinon on retourne une chaine vide
    return ""

def get_resource(res_path: str):
    """Returns a resource at res_path, its content type and an HTTP code.
    The HTTP status code is always 200, as we have already checked the file is present.

    Parameters
    ----------
    - res_path: str
        Requested resource string.

    Returns
    -------
    bytes
        The resource content if it exists (code == 200).
    int 
        A HTTP status code.
    """
   #creation du content en bytes binaires 
    content=b""
    #si le chemin correspond a une fichier 
    if os.path.isfile(res_path):
        #on louvre et on ecrit tout son contenu dans content
        with open(res_path, 'rb') as f:
            content = f.read()
        # on retourn e content avec code 200    
        return content,200
    #sinon on retourne content vide avec code 404
    else:
        return content,404