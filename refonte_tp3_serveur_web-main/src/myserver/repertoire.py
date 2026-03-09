import os

def affiche_rep(root:str, res:str):
    """Génère une page HTML listant les fichiers et dossiers d'un répertoire.
        param root: str
        param res: str
        return  str
    """
    liste = get_list(root, res)
    return root_to_html(root,res, liste)

def root_to_html(root,res, liste):
    """Transforme la liste des fichiers en page HTML avec des liens cliquables.
        param root: str 
        param res: str
        param liste: list
        return: str
    """
    html = f"""<!DOCTYPE html>
    <html>
    <head><title>Index of {res}</title></head>
    <body>
    <h1>Index of {res}</h1>
    <ul>
    """
    # Ajouter un lien pour revenir en arrière
    if res != "/":
        parent = os.path.dirname(res.rstrip("/"))
    # Générer les liens pour chaque élément du répertoire
    for c in liste:
        # Lien complet
        lien = f"{res.rstrip('/')}/{c}".replace("//", "/")  
        # Si c'est un dossier, ajouter un '/' à la fin
        if os.path.isdir(os.path.join(root, res, c)):
            html += f"<li><a href='{lien}/'>{c}/</a></li>\n"
        # Sinon, ajouter un lien simple
        else:
            html += f"<li><a href='{lien}'>{c}</a></li>\n"
    html += "</ul></body></html>"
    # Retourner la page HTML
    return html

def get_list(root:str, res:str):
    """Retourne la liste des fichiers et dossiers dans un répertoire.
        param root: str
        param res: str
        return: list   
    """
    # Récupérer le chemin complet
    chemin_complet = os.path.join(root, res.lstrip("/"))
    # Si le chemin n'existe pas, retourner une liste vide
    if not os.path.isdir(chemin_complet):
        return []
    #   Sinon, retourner la liste des fichiers et dossiers
    return os.listdir(chemin_complet)
