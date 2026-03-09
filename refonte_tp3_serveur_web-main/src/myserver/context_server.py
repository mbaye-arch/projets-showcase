# Description: Cette module contient les classes Context, Server, Client, Requete, Reponse et Fichier.
import socket 
import os
from pathlib import Path
import threading
from myserver.log import log, log_reply
from myserver.http_request import parse_request
from myserver.file import resolve_location, get_resource
from myserver.date import now_rfc2616 
from myserver.http import get_http_code, get_http_content_type
from myserver.repertoire import affiche_rep  # Import the module to use the function affiche_rep().
_BUF_SIZE = 4096
_SERVER_ADDR = "0.0.0.0"
"""
Cette classe permet de creer un contexte qui contient les modules necessaires pour le serveur.
Elle permet aussi de lancer le serveur.
"""
class Context : 
    def __init__(self):
        """classe context initialisation avec un dictionnaire vide"""
        self.ctx={}
    def addModule(self,cle:str,value):
        """ajoute un module au contexte tels que server
        cle : str
        value : module
        """
        self.ctx[cle]=value
    def runCtx(self):
        """lance le serveur"""
        if self.ctx["server"]:
            #lance le serveur
            self.ctx["server"].serve()
        else:
            print("aucune serveur ajoute au contexte")

"""
Cette classe permet de creer un serveur qui ecoute sur un port donne.
Elle permet aussi de gerer les clients qui se connectent au serveur.
"""
class Server:
    def __init__(self,port:int ,root:str):
        """initialisation du serveur avec le port et le root (le chemin du repertoire racine)
        params :
            port : int
            root : str
        """
        self.port=port
        self.root=root
        # liste des clients connectes
        self.clients = []
        # creation du socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # bind le socket a l'adresse et au port
        self.socket.bind((_SERVER_ADDR, self.port))
        # ecoute les connexions
        self.socket.listen()
        # affiche le message de demarrage
        log(f"Server started at {_SERVER_ADDR}:{self.port}.")

    def serve(self):
        """"
        Cette methode permet de gerer les clients qui se connectent au serveur.
        Elle cree un thread pour chaque client.
        """
        try: 
            while True:
                # accepte la connexion
                c, addr = self.socket.accept()
                #cree un client
                client = Client(c,addr[0],addr[1])
                # ajoute le client a la liste des clients
                self.clients.append(client)
                #cree un thread pour le client avec la methode handle_client
                thread = threading.Thread(target=client.handle_client, args=(self.root,))
                # demarre le thread
                thread.start()
        except KeyboardInterrupt:
            log("Received KeyboardInterrupt. Closing...")
            # ferme le serveur
            self.close()
    def close(self):
        """ferme le serveur"""
        self.socket.close()

"""
Cette classe permet de creer un client qui se connecte au serveur.
Elle permet aussi de gerer les requetes des clients.
"""
class Client:
    def __init__(self,c :socket.socket, adresse_ip:str, port:int):
        """initialisation du client avec le socket, l'adresse ip et le port
        params :
            c : socket.socket socket du client retourne par la methode accept
            adresse_ip : str adresse ip du client
            port : int port du client
        """
        self.soc= c
        self.adresse_ip = adresse_ip
        self.port = port
    def handle_client(self,root:str):
        """
        Cette methode permet de gerer les requetes des clients.
        Elle recoit la requete du client, la parse, prepare la ressource et envoie la reponse au client
        params :
            root : str chemin du repertoire racine
        """
        # recoit la requete
        buf = self.soc.recv(1024)
        # parse la requete
        req=None
        # code de la reponse
        code=0
        # si la requete n'est pas vide
        if buf!=b"":
            # parse la requete
            req=parse_request(buf)
            # cree un objet requete
            requete = Requete(req["head"]["verb"],req['head']['resource'])
            # si la methode est GET
            if requete.verb and requete.verb == 'GET':
                reply, code = requete.prepare_resource(root)
            # si la methode n'est pas GET
            else:
                # on cree un objet reponse avec le code 501
                reponse = Reponse(b"", "", 501)
                # on prepare la reponse
                reply, code = reponse.prepare_reply()
            # envoie la reponse
            self.soc.sendall(reply)
        log_reply((self.adresse_ip,self.port), req, code)
        self.soc.close()
"""
Cette classe permet de creer une requete avec la methode et la ressource.
Elle permet aussi de preparer la ressource."""
class Requete:
    def __init__(self,verb:str,resource:str):
        """initialisation de la requete avec la methode et la ressource
        params :
            verb : str le verbe de la requete
            resource : str le ressource de la requete
        """
        self.verb=verb
        self.resource=resource
    def prepare_resource(self,root: str,):
        """
        Cette methode permet de preparer la ressource.
        Elle verifie si la ressource existe, si c'est un repertoire ou un fichier.
        Elle prepare la reponse en fonction de la ressource.
        params :
            root : str chemin du repertoire racine
        return : bytes, int
        """
        # on cree un objet fichier avec le chemin de la ressource et son extension
        fichier = Fichier(resolve_location(self.resource, root)[0],resolve_location(self.resource, root)[1])
        # si ce nest pas un fichier
        if not fichier.existe():
            # on cree un objet reponse avec le code 404
            reponse = Reponse(b"Resource not found","text/plain",404)
            # et on prepare la reponse
            return reponse.prepare_reply()
        # si le fichier c'est un repertoire
        elif fichier.est_un_repertoire():
            # on cree un objet fichier avec le chemin du repertoire index.html
            fichier =Fichier(Path(fichier.chemin) / "index.html","html")
            # si le fichier index.html existe dans le repertoire dans laquellle on est
            if fichier.est_fichier():
                # on cree un objet reponse avec le contenu du fichier index.html
                reponse = Reponse(get_resource(fichier.chemin)[0],get_http_content_type(fichier.extension),get_resource(fichier.chemin)[1])
            else:
                # on cree un objet reponse avec le contenu du repertoire
                reponse = Reponse(affiche_rep(root, self.resource),"text/html",200)
        else:
            # on cree un objet reponse avec le contenu du fichier
            reponse = Reponse(get_resource(fichier.chemin)[0],get_http_content_type(fichier.extension),get_resource(fichier.chemin)[1])
        return reponse.prepare_reply()
"""
Cette classe permet de creer une reponse avec le contenu, le type de contenu et le code.
Elle permet aussi de preparer la reponse.
"""
class Reponse:
    def __init__(self,contenu:bytes,type_contenu:str,code:int):
        """initialisation de la reponse avec le contenu, le type de contenu et le code
        params :
            contenu : bytes le contenu de la reponse
            type_contenu : str le type de contenu de la reponse
            code : int le code de la reponse
        """
        self.contenu=contenu
        self.type_contenu =type_contenu
        self.code = code
    def prepare_reply(self,):
        """
        Cette methode permet de preparer la reponse.
        Elle prepare le header de la reponse en fonction du code.
        Elle prepare le contenu de la reponse.
        return : bytes, int
        """
        # on recupere le header en fonction du code
        header = get_http_code(self.code)
        # si le code est dieffrent de 200
        if self.code !=200: 
            #la contenu de notre reponse est le message d'erreur
            self.contenu = header['html'].encode()
            self.type_contenu = "text/html"
        header = f"""HTTP/1.0 {header['header']}
    Content-Type: {self.type_contenu}
    Date: {now_rfc2616()}
    Content-Length: {len(self.contenu)}
    Server: RegardeMamanJeFaisUnServeurWeb/0.1

    """.encode()
        # si le contenu est une chaine de caractere on le convertit en bytes
        if isinstance(self.contenu,str):
            self.contenu = self.contenu.encode("utf-8")
        return header + self.contenu, self.code 
    
""""Cette classe permet de creer un objet fichier avec le chemin et l'extension du fichier.
Elle permet aussi de verifier si le fichier existe, si c'est un repertoire ou un fichier.
"""
class Fichier:
    def __init__(self,chemin:str,extension:str):
        """
        initialisation du fichier avec le chemin et l'extension
        params :
            chemin : str le chemin du fichier
            extension : str l'extension du fichier
        """
        self.chemin=chemin
        self.extension = extension

    def existe(self):
        """
        Cette methode permet de verifier si le fichier existe.
        return : bool
        """
        return self.chemin != ""
    def est_un_repertoire(self):
        """
        Cette methode permet de verifier si le fichier est un repertoire.
        return : bool
        """
        return os.path.isdir(self.chemin)
    def est_fichier(self):
        """
        Cette methode permet de verifier si le fichier est un fichier.
        return : bool
        """
        return self.chemin.is_file()