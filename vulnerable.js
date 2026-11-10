
 // TEST DEVSECOPS - VULNERABILITE VOLONTAIRE
 // Ne jamais utiliser ce code en production.

 function unsafeEvaluate(userInput) {
   return eval(userInput);
 }

 module.exports = { unsafeEvaluate };
