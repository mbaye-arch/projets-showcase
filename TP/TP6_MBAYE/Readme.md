# TP6 Calculette
# Étudiant : Abdoulaye Mbaye, Groupe 1

# Calculette implemente 
    1.Calculette Infixe
    2.Calculette Postfixe


# InfixedCalculator 
Le calculator infixe est la meme sur la calculator-V2.jar.
le calculator est bien fait et gere toutes les aspects qui sont definis dans calculator-V2.jar.
utilisant les interfaces Operateur pour rende le code plus modulaire 

ajout de la gestion de lerreur dune division par 0 ou du Modulo par 0;


# Pour generer le javadoc
```javadoc -sourcepath src -subpackages infixedcalculator -d docs```

# Pour compiler le tout le code de InfixedCalculator:
```javac -sourcepath src src/infixedcalculator/*.java -d classes```

# Pour executer sur le fichier InfixedMain:
```java -classpath classes infixedcalculator.InfixedMain```

# Pour compiler les fichier teste du calculatorInfixe
```javac -classpath junit-console.jar:classes Teste/infixedcalculator/*.java -d classes```

# Pour executer les fichier testes compiler
```java -jar junit-console.jar -classpath test:classes -select-class Teste.infixedcalculator.InfixedCalculatorTest```

# Pour generer le jar du CalculatorInfixe:
```jar cvfe Infixed.jar infixedcalculator.InfixedMain -C classes .```

# Pour executer le jar CalculatorInfixed.jar
```java -jar Infixed.jar```


# PostFixedCalculator
Le calculator postfixer est la meme sur la jar postfixed-calc.jar.
le calculator est bien fait et gere toutes les aspects qui sont definis dans postfixed-calc.jar.
utilisant les interfaces Operateur pour rende le code plus modulaire.

ajout de la gestion de lerreur dune division par 0 ou du Modulo par 0;


# Pour generer le javadoc
```javadoc -sourcepath src -subpackages postfixedcalculator -d docs/postfixedcalculator```

# Pour compiler le tout le code de PostFixedCalculator:
```javac -sourcepath src src/postfixedcalculator/*.java -d classes```

# Pour executer sur le fichier PostFixedMain:
```java -classpath classes postfixedcalculator.PostFixedMain```

# Pour compiler les fichier teste du calculatorPostFixed
```javac -classpath junit-console.jar:classes Teste/postfixedcalculator/*.java -d classes```

# Pour executer les fichier testes compiler
```java -jar junit-console.jar -classpath test:classes -select-class Teste.postfixedcalculator.PostFixedCalculatorTest```

# Pour generer le jar du CalculatorInfixe:
```jar cvfe PostFixed.jar postfixedcalculator.PostFixedMain -C classes .```

# Pour executer le jar CalculatorInfixed.jar
```java -jar PostFixed.jar```


