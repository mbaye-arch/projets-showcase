# Image Decoupe

Projet Python de traitement d'image base sur un decoupage recursif en blocs.

## Objectif

Le programme lit une image, la divise en rectangles, calcule la couleur moyenne de chaque zone, puis genere une version mosaique. C'est un bon exercice pour manipuler :

- les pixels RGB avec Pillow ;
- les classes Python et les dataclasses ;
- le decoupage recursif ;
- la generation d'un fichier image de sortie.

## Stack

- Python 3
- Pillow

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Utilisation

```bash
python image_rec.py calbuth.png --depth 3 --output outputs/calbuth-mosaic.png
```

Plus la profondeur est grande, plus l'image est decoupee en petits blocs.

## Fichiers principaux

- `bloc_class.py` : classe `Bloc`, calcul de couleur moyenne et generation de mosaique ;
- `image_rec.py` : interface CLI pour lancer le traitement ;
- images racines : exemples de test visuel.

## Note publication

Le dossier `outputs/` est ignore car il contient des images generees localement.
