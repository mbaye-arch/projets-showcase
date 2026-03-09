#!/bin/bash
# Mise à jour complète du système Debian
echo "Mise à jour du système et des paquets..."

# Met à jour la liste des paquets
echo "Mise à jour de la liste des paquets..."
if apt-get update -y > /dev/null 2>&1; then
    echo "Liste des paquets mise à jour."
else
    echo "Erreur lors de la mise à jour de la liste des paquets !" >&2
    exit 1
fi

# Met à jour les paquets installés avec dist-upgrade pour première VM
echo "Mise à jour des paquets système..."
if apt-get dist-upgrade -y > /dev/null 2>&1; then
    echo "Mise à jour du système terminée avec succès."
else
    echo "Attention : Certains paquets n'ont pas pu être mis à jour." >&2
    echo "Continuant malgré tout..."
fi
