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

This module (file) provides information relative to the HTTP specification.
"""


def get_http_code(code: int):
    """Returns a dict corresponding to the HTTP status code.

    See also : https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    
    Parameters
    ----------
    - code: int 
        An HTTP code.

    Returns
    -------
    dict 
        Information about the HTTP code, containing fileds:
        - header: str 
            The code string to put in an HTTP reply header.
        - html: str 
            The HTML to reply as HTTP content.
    """

    if code == 200:
        return {
            "header": "200 OK",
            "html": ""
        }
    elif code == 403:
        return {
            "header": "403 Forbidden",
            "html": """<html>
<body>
    <h1>Erreur 403 : Interdit</h1>
    <p>Une porte fermée se tient devant vous ; et vous n'avez pas la clé.</p>
</body>
</html>
"""
        }
    elif code == 404:
        return {
            "header": "404 Not Found",
            "html": """<html>
<body>
    <h1>Erreur 404</h1>
    <p>Vous avez traversé les limites du Web. Où que vous soyez, ce n'est sur aucune carte.</p>
</body>
</html>
"""
        }
    elif code == 501:
        return {
            "header": "501 Not implemented",
            "html": """<html>
<body>
    <h1>Erreur 501 : Non implémenté</h1>
    <p>Ce que vous demandez est acceptable, mais on ne fait pas ça chez nous.</p>
</body>
</html>
"""
        }
    else: # 500
        return {
            "header": "500 Internal Server Error",
            "html": """<html>
<body>
    <h1>Erreur 500 : InTERNal SRveR ER0ooOR</h1>
    <p>Erreur serveur inconnue.</p>
</body>
</html>
"""
        }

# From: https://source.chromium.org/chromium/chromium/src/+/main:net/base/mime_util.cc;l=147
# The Chromium authors, 2012, BSD Licence
file_extension_to_content_type = {
    "webm": "video/webm",
    "mp3": "audio/mpeg",
    "wasm": "application/wasm",
    "crx": "application/x-chrome-extension",
    "xhtml": "application/xhtml+xml",
    "xht": "application/xhtml+xml",
    "xhtm": "application/xhtml+xml",
    "flac": "audio/flac",
    "ogg": "audio/ogg",
    "oga": "audio/ogg",
    "opus": "audio/ogg",
    "wav": "audio/wav",
    "m4a": "audio/x-m4a",
    "avif": "image/avif",
    "gif": "image/gif",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "apng": "image/apng",
    "svg": "image/svg+xml",
    "svgz": "image/svg+xml",
    "webp": "image/webp",
    "mht": "multipart/related",
    "mhtml": "multipart/related",
    "css": "text/css",
    "html": "text/html",
    "htm": "text/html",
    "shtml": "text/html",
    "shtm": "text/html",
    "js": "text/javascript",
    "mjs": "text/javascript",
    "xml": "text/xml",
    "mp4": "video/mp4",
    "m4v": "video/mp4",
    "ogv": "video/ogg",
    "ogm": "video/ogg",
    "csv": "text/csv",
    "ico": "image/vnd.microsoft.icon"
}

def get_http_content_type(extension: str):
    """Returns the HTTP Content-Type corresponding to a file extension.

    Returns "application/octet-stream" when the extension is unknown.

    Parameters
    ----------
    - extension: str
        A file extension.

    Returns
    -------
    str 
        An HTTP Content-Type 
    """
    if file_extension_to_content_type.get(extension) is None:
        return "application/octet-stream"
    return file_extension_to_content_type[extension]
