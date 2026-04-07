# Déclare la cible 'test' comme étant phony (toujours exécutée)
.PHONY: test

FILES_TO_COMPILE = \
    test/ares/util/action/AcheterArmeScreteTest.java \
	test/ares/util/action/AjouterGuerrierTest.java \
	test/ares/util/action/AjouterGuerrierStockTest.java \
	test/ares/util/action/AttaquerUnAutreJoueurTest.java \
	# test/ares/util/action/ConstruireArméeTest.java \
	# test/ares/util/action/RemplacerArmeCampTest.java \
	# test/ares/util/batiment/ArméeTest.java \
	# test/ares/util/batiment/CampTest.java \
	# test/ares/util/joueur/objectif/ConquerTuileTest.java \
	# test/ares/util/joueur/objectif/EnvIleTest.java \
	# test/ares/util/joueur/objectif/NbGuerrierObjectifTest.java \
	# test/ares/util/joueur/JoueurAresTest.java \
	# test/ares/util/ressource/ArmeSecreteTest.java \
	# test/ares/util/ressource/GuerrierTest.java \
	# test/ares/AresTest.java \
	# test/demeter/util/action/AcheterVoleurTest.java \
	# test/demeter/util/action/EchangerRessourceViaPortTest.java \
	# test/demeter/util/action/JouerVoleurTest.java \
	# test/demeter/util/action/RemplacerFermeExploitationTest.java \
	#test/demeter/util/action/ConstruireFermeTest.java \


doc:
	javadoc -d docs `find src -name "*.java"`

compile:
	javac -d classes `find src -name "*.java"`

# Compilation des tests en excluant certains fichiers spécifiques
compile-tests:
	javac -d classes -classpath junit-console.jar:classes $(FILES_TO_COMPILE)

test:
	java -jar junit-console.jar -classpath test:classes -scan-classpath

jar:
	jar cvfe Livrable4ares.jar Livrable4Ares -C classes .
	jar cvfe Livrable4demeter.jar Livrable4Demeter -C classes .

ares:
	java -classpath classes AresMain

demeter:
	java -classpath classes DemeterMain


clean:
	rm -rf classes docs
