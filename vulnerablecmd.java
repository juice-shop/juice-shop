import java.io.*;

public class VulnerableCmd {
    public static void main(String[] args) throws Exception {
        String userInput = args[0]; // ❌ unvalidated user input

        // ❌ Command Injection
        String cmd = "ping " + userInput;

        Process p = Runtime.getRuntime().exec(cmd);   // Vulnerable sink
        BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
    }
}
