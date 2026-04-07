abdoulayembaye@DESKTOP-9C47IPF:~/rendu/l2s4-projet-2025$ java -jar junit-console.jar -classpath test:classes -scan-classpath

Thanks for using JUnit! Support its development at https://junit.org/sponsoring

╷
├─ JUnit Jupiter ✔
│  ├─ AcheterVoleurTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ PaturageTest ✔
│  │  ├─ testGetRessource() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ testPaturageConstructor() ✔
│  ├─ DeTest ✔
│  │  ├─ testConstructeurEtGetters() ✔
│  │  ├─ testLancerDes_UnSeulTirage() ✔
│  │  ├─ testLancerDes_LimiteSuperieure() ✔
│  │  ├─ testLancerDes_MultipleTirages() ✔
│  │  └─ testLancerDes_LimiteInferieure() ✔
│  ├─ EchangerRessourceViaPortTest ✔
│  │  ├─ testActWithPort() ✔
│  │  ├─ testToString() ✔
│  │  └─ testActWithoutPort() ✔
│  ├─ NeRienFaireTest ✔
│  │  ├─ testAct() ✔
│  │  └─ testToString() ✔
│  ├─ JeuTest ✔
│  │  ├─ testHasDeuxBatiment() ✔
│  │  ├─ testCreationJeu() ✔
│  │  ├─ testGetPositionsVideVoisinsMer() ✔
│  │  ├─ testGetNbGuerrierIleJoueur() ✔
│  │  ├─ testOccupeIle() ✔
│  │  ├─ testRemoveBatiment() ✔
│  │  ├─ testSupprimerJoueur() ✔
│  │  ├─ testGetIlesOccupeJoueur() ✔
│  │  ├─ testDisplayTuileBatiment() ✔
│  │  ├─ testHasPort() ✔
│  │  ├─ testChoixInvalide() ✔
│  │  ├─ testAddBatiment() ✔
│  │  ├─ testGetIlePosition() ✔
│  │  └─ testAjouterJoueur() ✔
│  ├─ ConstruirePortTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ GuerrierTest ✔
│  │  ├─ testToString() ✔
│  │  └─ testEquals() ✔
│  ├─ CampTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testGetNbGuerrier() ✔
│  │  ├─ testSetNbGuerrier() ✔
│  │  ├─ testAddGuerrier() ✔
│  │  ├─ testEquals() ✔
│  │  └─ testToStringB() ✔
│  ├─ BleTest ✔
│  │  ├─ constructorTest() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ toStringTest() ✔
│  ├─ MontagneTest ✔
│  │  ├─ testMontagneConstructor() ✔
│  │  ├─ testGetRessource() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ testProdRessource() ✔
│  ├─ JouerVoleurTest ✔
│  │  ├─ testActWithoutVoleur() ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  └─ testActWithSufficientResources() ✔
│  ├─ DemeterTest ✔
│  │  ├─ testInitialiseJeu() ✔
│  │  ├─ testCreationDemeter() ✔
│  │  ├─ testGame() ✔
│  │  ├─ testChosirAction() ✔
│  │  ├─ testGetGagnant() ✔
│  │  └─ testGetNbTours() ✔
│  ├─ ConstruireFermeTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ AttaquerUnAutreJoueurTest ✔
│  │  ├─ testActWithNoArmyOrCamp() ✔
│  │  ├─ testCibleSansArmeeEtSansRessource() ✔
│  │  ├─ testToString() ✔
│  │  └─ testActWithRessource() ✔
│  ├─ ActionTest ✔
│  │  ├─ testAPrerequis() ✔
│  │  ├─ testDisplayNoRessource() ✔
│  │  ├─ testToString() ✔
│  │  ├─ testDisplayActionEffectue() ✔
│  │  ├─ testDisplayPrerequis() ✔
│  │  ├─ testGetPrerequis() ✔
│  │  ├─ testRetireRessource() ✔
│  │  ├─ testChoixInvalide() ✔
│  │  └─ testGetJeu() ✔
│  ├─ IleTest ✔
│  │  ├─ testIlesNotEmpty() ✔
│  │  ├─ testAfficherIles() ✔
│  │  ├─ testAUnVoisinProche() ✔
│  │  ├─ testDonneIle() ✔
│  │  └─ testPlateauNotNull() ✔
│  ├─ FermeTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testGetDimension() ✔
│  │  ├─ testEquals() ✔
│  │  └─ testGetProprietaire() ✔
│  ├─ ChampsTest ✔
│  │  ├─ testGetRessource() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ testChampsConstructor() ✔
│  ├─ AcheterArmeScreteTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActSuccess() ✔
│  │  ├─ testActFailure() ✔
│  │  └─ testEquals() ✔
│  ├─ AjouterGuerrierTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResourcesForCamp() ✔
│  │  ├─ testEquals() ✔
│  │  └─ testActWithSufficientResourcesArme() ✔
│  ├─ MerTest ✔
│  │  ├─ equalsTest() ✔
│  │  └─ testMerConstructor() ✔
│  ├─ MineraisTest ✔
│  │  ├─ constructorTest() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ toStringTest() ✔
│  ├─ JoueurDemeterTest ✔
│  │  ├─ testAUnPort() ✔
│  │  ├─ testToString() ✔
│  │  ├─ testSetNbPoints() ✔
│  │  ├─ testGetNbPoints() ✔
│  │  ├─ testCreationJoueurDemeter() ✔
│  │  ├─ testDisplay() ✔
│  │  ├─ testGetStockVoleur() ✔
│  │  └─ testEquals() ✔
│  ├─ BoisTest ✔
│  │  ├─ constructorTest() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ toStringTest() ✔
│  ├─ AjouterGuerrierStockTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ GenereTest ✔
│  │  ├─ testGenerateListeTuile() ✔
│  │  ├─ testGenereTuile() ✔
│  │  └─ testDonneListePosition() ✔
│  ├─ ForetTest ✔
│  │  ├─ testForetConstructor() ✔
│  │  ├─ testGetRessource() ✔
│  │  └─ equalsTest() ✔
│  ├─ AresTest ✔
│  │  ├─ testInitialiseJeu() ✔
│  │  ├─ testCreationAres() ✔
│  │  ├─ testGame() ✔
│  │  ├─ testChosirAction() ✔
│  │  ├─ testGetGagnant() ✔
│  │  └─ testGetNbTours() ✔
│  ├─ ConstruireArméeTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ PositionTest ✔
│  │  ├─ testSet() ✔
│  │  ├─ testToString() ✔
│  │  ├─ testGetPositionVoisin() ✔
│  │  ├─ testIsValide() ✔
│  │  ├─ testConstructorGetters() ✔
│  │  ├─ testNextPosition() ✔
│  │  ├─ testGetCoteAlea() ✔
│  │  └─ testEquals() ✔
│  ├─ VoleurTest ✔
│  │  ├─ testToString() ✔
│  │  └─ testEquals() ✔
│  ├─ TuileTest ✔
│  │  ├─ testGetPosition() ✔
│  │  ├─ setPositionTest() ✔
│  │  ├─ ProdRessourcetest() ✔
│  │  ├─ testTuileConstructeur() ✔
│  │  ├─ equalsTest() ✔
│  │  ├─ getBatimentTest() ✔
│  │  ├─ getNbResTest() ✔
│  │  └─ setBatimentTest() ✔
│  ├─ ArmeSecreteTest ✔
│  │  ├─ testToString() ✔
│  │  └─ testEquals() ✔
│  ├─ MoutonTest ✔
│  │  ├─ constructorTest() ✔
│  │  ├─ equalsTest() ✔
│  │  └─ toStringTest() ✔
│  ├─ ArméeTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testGetNbGuerrier() ✔
│  │  ├─ testSetNbGuerrier() ✔
│  │  ├─ testConstructorInvalidNbGuerrier() ✔
│  │  ├─ testAddGuerrier() ✔
│  │  ├─ testEquals() ✔
│  │  └─ testToStringB() ✔
│  ├─ ExploitationTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testGetDimension() ✔
│  │  ├─ testEquals() ✔
│  │  └─ testGetProprietaire() ✔
│  ├─ RemplacerFermeExploitationTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ EchangeRessourceTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  ├─ RemplacerArmeCampTest ✔
│  │  ├─ testToString() ✔
│  │  ├─ testActWithInsufficientResources() ✔
│  │  ├─ testActWithSufficientResources() ✔
│  │  └─ testEquals() ✔
│  └─ JoueurAresTest ✔
│     ├─ testToString() ✔
│     ├─ testCreationJoueurAres() ✔
│     ├─ testPossedeArmeSecrete() ✔
│     ├─ testGetStockGuerriers() ✔
│     ├─ testEquals() ✔
│     ├─ testUtiliserArmeSecrete() ✔
│     └─ testGetNombreGuerriers() ✔
├─ JUnit Vintage ✔
│  ├─ JoueurTest ✔
│  │  ├─ testCreationJoueur ✔
│  │  ├─ testToString ✔
│  │  ├─ testRetraitRessource ✔
│  │  ├─ testAjoutRessource ✔
│  │  └─ testEquals ✔
│  ├─ PortTest ✔
│  │  ├─ testToString ✔
│  │  ├─ testDimension ✔
│  │  ├─ testEquals ✔
│  │  └─ testProprietaire ✔
│  ├─ BatimentTest ✔
│  │  ├─ testToString ✔
│  │  ├─ testAddDimension ✔
│  │  ├─ testGetDimension ✔
│  │  ├─ testEquals ✔
│  │  ├─ testSetDimension ✔
│  │  └─ testGetProprietaire ✔
│  └─ PlateauTest ✔
│     ├─ testGetLigne ✔
│     ├─ testGetTuile ✔
│     ├─ testGetTuileNonMer ✔
│     ├─ testPlateauInitialization ✔
│     ├─ testEstValide ✔
│     ├─ testPlateauDimensions ✔
│     ├─ testGetPlateau ✔
│     ├─ testGetColonne ✔
│     ├─ testDisplay ✔
│     ├─ testGetTuileVide ✔
│     └─ testAfficheTete ✔
└─ JUnit Platform Suite ✔

Test run finished after 3968 ms
[        48 containers found      ]
[         0 containers skipped    ]
[        48 containers started    ]
[         0 containers aborted    ]
[        48 containers successful ]
[         0 containers failed     ]
[       213 tests found           ]
[         0 tests skipped         ]
[       213 tests started         ]
[         0 tests aborted         ]
[       213 tests successful      ]
[         0 tests failed          ]

abdoulayembaye@DESKTOP-9C47IPF:~/rendu/l2s4-projet-2025$ 