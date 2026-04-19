/*****************************************************
           === Variables globales=== 
******************************************************/

let BUTTONS = document.getElementsByTagName("button");
//TODO placez si besoin vos autres variables globales ici
let CASE = document.getElementsByTagName("td");

/*****************************************************
           === Initialisation de la page=== 
******************************************************/

/**
 * initialisation
 * En réponse à un click sur le premier bouton du header 
 * la fonction chargerSelections est déclenchée
 */
const init = function(){
    /** evenment sur le 1 et application de chargerselection lorsquil ya clic dessus */
    BUTTONS[0].addEventListener("click",chargerSelections);
}


/**
 * Configure les boutons correspondants aux phases à réaliser
 * @param {number} nEtape - n° de l'étape à réaliser
 * @param {Function} fPrecedente - fonction dont il faut se désabonner
 * @param {Function} fSuivante - fonction à déclencher au click du prochain bouton
 */
const prochaineEtape = function(nEtape, fPrecedente, fSuivante){
    BUTTONS[nEtape-1].style.opacity="0.2";
    BUTTONS[nEtape-1].removeEventListener("click", fPrecedente);
    BUTTONS[nEtape].style.opacity="1";
    BUTTONS[nEtape].addEventListener("click", fSuivante);
    const texteHeader= document.querySelector("header>span");
    switch(nEtape){
    case 1:
        texteHeader.textContent = "Prochaine étape : Diaporama des stades accueillant l'épreuve";
        document.getElementById("illustration").style.backgroundImage= "url(./images/pexels-juan-salamanca-61143.jpg)";
        break;
    case 2:
        texteHeader.innerHTML = "Prochaine étape : Paul le Poulpe prédit les deux premiers de chaque groupe";
        document.getElementById("illustration").style.backgroundImage= "url(./images/paul.jpg)";
        break;
    case 3 :
        texteHeader.textContent = "Prochaine étape : Nelly l'éléphante prédit les deux meilleurs troisièmes";
        document.getElementById("illustration").style.backgroundImage= "url(./images/Nelly-l-elephant.jpg)";
        break;
    case 4 :
        texteHeader.textContent = "Dernière étape : afficher les qualifiés pour les quarts de finale";
        document.getElementById("illustration").style.visibility= "hidden";
        break;
    }
}

/**********************************************************************************
           ===Création des sélections nationales et des informations === 
*********************************************************************************/

/** 
 * Rempli une case de la table appartenant à un groupe de qualification
 * les attributs id et class sont également mis à jour
 * Cette case est abonnée à un click qui déclenchera la fonction afficheInfoPays
 * @param {HTMLElement} td - case d'une table HTML
 * @param {Object} data - données d'un pays
 */
/* cette fonction applique le nom de l'equipe sur le tableau*/
const rempliTd = function(td, data){
    td.innerHTML=data.nom;
    td.id=data.code;
    td.addEventListener("mouseover",afficheInfoPays);
}


/** 
 * A partir des données  présentes dans le script "equipes.js"
 * remplit les tables des groupes en utilisant la fonction rempliTd
 */
const chargerSelections = function(){
    for (const data of countryData){
        const tableGroupe = document.getElementById(data.poule);
        const tds = tableGroupe.getElementsByTagName("td");
        let i =0;
        let emplacementTrouve= false;
        while (i<countryData.length && !emplacementTrouve){
            if (tds[i].textContent == "-")
                emplacementTrouve=true;
            i++;
        }
        rempliTd(tds[i-1], data);
    } 
    // prochaine étape : afficher un diaporama des stades
    prochaineEtape(1, chargerSelections, afficherStades)
}


/**
 * Crée des éléments HTML décrivant chacune des équipes nationales
 * dans l'élément d'id "infoPays"
 */
const afficheInfoPays = function(){
    const infoPays = document.getElementById("infoPays");
    infoPays.innerHTML="";
    const code = this.id;
    /* la ligne de code suivante permet de retrouver l'objet pays dans le tableau
    à partir de son code, si vous voulez en savoir plus sur les arrow function
    vous pourrez consulter par exemple le cours de L2 
    https://www.fil.univ-lille.fr/~routier/enseignement/licence/js-s4/html/javascript-1.html
    */
    const pays = countryData.find(element => element.code == code);
    /* vous pouvez maintenant accéder aux attributs de cet objet facilement
    par exemple l'expression pays.nom correspond au nom du pays dont le code a été passé
    en paramètre de cette fonction*/
    const nom = pays.nom;
    const h1 = document.createElement("h1");
    h1.textContent= nom;
    infoPays.appendChild(h1);

    // TODO : ajouter le logo de l'équipe
    const logo = pays.logo;
    const img = document.createElement("img");
    img.src= "images/equipes/"+logo;
    infoPays.appendChild(img)

    // TODO : ajouter la liste d'informations
    const confederation = pays.confederation;
    const surnom = pays.surnom;
    const ul = document.createElement("ul");
    const confli = document.createElement("li");
    confli.textContent = "Confederation : "+ confederation;
    const surnomli = document.createElement("li");
    surnomli.textContent="Surnom : "+surnom
    ul.appendChild(confli);
    ul.appendChild(surnomli);
    infoPays.appendChild(ul);


    // Tableau de médailles ajouté
    const medailles = pays.medailles;
    const table = document.createElement("table")
    infoPays.appendChild(table)
    table.innerHTML = creeTableauMedailles();
    rempliTableauMedailles(table, medailles);

    // TODO : ajout de la mention pays organisateur
    if (pays.nom == "France"){
        const p = document.createElement("p");
        p.textContent= "Pays Organisateur";
        infoPays.appendChild(p);
    }
}

/**
 * Créer les lignes de la table de médailles
 * @return {string} - code HTML représentant les deux lignes de la table de médailles
 */
const creeTableauMedailles = function(){
    // l'utilisation des caractères ` permet de fabriquer des chaines multilignes
    // plus agréable à lire
    const codeTable = `<tr>
                            <th>🥇</th>
                            <th>🥈</th>
                            <th>🥉</th>
                            <th>total</th>
                        </tr>
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>0</td>
                        </tr>`
    return codeTable;
}


/**
 * Rempli le tableau de médailles
 * @param {HTMLElement} table - table HTML
 * @param {Array} medailles - array du nombre de médailles
 */

const rempliTableauMedailles = function(table, medailles){
    //TODO remplir les cases correspondants aux nombres de médailles
    const element = document.getElementsByTagName("td");
    element[0].textContent = medailles[0];
    element[1].textContent = medailles[1];
    element[2].textContent = medailles[2];
    // TODO remplir la case donnant la somme des médailles obtenues
    element[3].textContent = medailles[0] + medailles[1] + medailles[2];
}

/*************************************************************
           ===Diaporama des stades=== 
************************************************************/
/**
 * lance le diaporama en utilisant la variable globale
 * monTimer
 */

const afficherStades = function(){
    //TODO : mettre en place le diaporama
    const image = document.getElementById("stades");
    
    // passage à l'étape suivante
    prochaineEtape(2, afficherStades, qualifPremiers);
}


// TODO :  autres fonctions éventuelles nécessaires
// vous pouvez également créer des variables globales si besoin dans la section correspondante


/*************************************************************
           ===Prévisions=== 
************************************************************/

/**
 * Prévision de Paul le Poulpe
 */
const qualifPremiers = function(){
    const unEtDeux = new Array();
    for(let i=0 ; i<3; i++)
        unEtDeux.push(deuxPremiers())
    miseAJourDeuxPremiers(unEtDeux);
    prochaineEtape(3, qualifPremiers, meilleursTrois)
} 

/**
 * Renvoie la position des deux premiers qualifiés pour un groupe
 * @return {Array} - tableau de deux nombres entiers différents 
 * compris entre 1 et 4 (bornes incluses)
 */
const deuxPremiers = function(){
    //TODO
}



/**
 * @param {Array} tab - tableau des deux premiers de chaque groupe
 */
const miseAJourDeuxPremiers = function(tab){
    for (let i=0; i<2; i++){
        qualifie("A", tab[0][i], i+1);
        qualifie("B", tab[1][i], i+1);
        qualifie("C", tab[2][i], i+1);
    }
}

/**
 * Choix et mise à jour des meilleurs troisièmes prévus 
 * par Nelly  
 */
const meilleursTrois = function(){
    //selection groupe
    const groupes = ['A','B','C'];
    let ig, g, equipes, ie;
    for (let i = 0; i<2; i++){
        ig = Math.floor(Math.random() * groupes.length)
        g = groupes[ig]
        groupes.splice(ig,1)
        equipes = document.querySelectorAll("td[class^="+g+"]");
        let trouve = false;
        ie=null;
        while(!trouve){
            ie = alea1_4();
            if (equipes[ie-1].classList.length==1)
                trouve = true;
        }
        qualifie(g, ie, 3)
    }
    prochaineEtape(4, meilleursTrois, listeQualifies);
}


/**
 * met à jour le style et les attributs des cases 
 * des tables des groupes fonction de la place prévue
 * par Paul le Poule ou Nelly l'Elephante
 */
const qualifie= function (groupe, indice, pos){
    const table = document.getElementById(groupe);
    const td = table.querySelector("tbody tr:nth-child("+indice+") td");
    switch (pos){
        case 1 :
            td.style.backgroundColor = "#e1a624";
            td.classList.add("q1");
            break;
        case 2 :
            td.style.backgroundColor = "#317ac1";
            td.classList.add("q2");
            break;
        case 3 :
            td.style.backgroundColor = "LemonChiffon";
            td.classList.add("q3");
            break;
        default:
            break;
        
    }
}


/*************************************************************
           ===Affichage liste qualifiés=== 
************************************************************/

/**
 * Affiche la liste des qualifiés dans l'élément d'id "qualifies"
 * un compteur local est incrémenté, une assertion vérifie le nombre de quarts de finalistes
 */
const listeQualifies = function(){
    let compteur = 0; //TODO incrémenter le compteur pour chaque équipe qualifiée
    //TODO


    
    // assertion (comme en Python), ici pour vérifier qu'il y a bien 8 qualifiées
    console.assert(compteur==8, "Il doit y avoir 8 équipes");
    this.removeEventListener("click", listeQualifies);
    this.style.opacity="0.2";
    window.clearInterval(monTimer);
    const texteHeader= document.querySelector("header>span");
    texteHeader.textContent = "Bonne compétition !";
}

/*************************************************************
           ===Initialisation de la page=== 
************************************************************/

init();