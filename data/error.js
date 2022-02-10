console.log("calling dangerousFunction() with static string");
var userInput = req.body.danger;
lib.dangerousFunction("static input is fine"); // compliant
console.log("calling dangerousFunction() with user input");
lib.dangerousFunction(userInput); // non-compliant
console.log("dangerousFunction() called successfully");
const password="123";