// File: VulnerableApp.java
// PURPOSE: Intentionally vulnerable sample for SAST scanner testing.
// NOTES: Do NOT use in production. This file includes multiple, obvious vulnerabilities.
//
// Potential findings a scanner may flag (non-exhaustive):
//  - Hardcoded credentials / secrets
//  - SQL Injection (string concatenation)
//  - Command Injection (Runtime.exec with untrusted input)
//  - Path Traversal (user-controlled file path)
//  - Insecure Randomness (java.util.Random for tokens)
//  - Weak Cryptography (MD5 / SHA-1)
//  - Insecure SSL (trust-all certificates / hostname verifier)
//  - Insecure Deserialization (ObjectInputStream on untrusted data)
//  - XXE (external entities enabled)
//  - Logging sensitive information
//  - Resource leaks / missing try-with-resources
//  - Use of deprecated / insecure APIs

import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.sql.*;
import java.util.*;
import javax.net.ssl.*;
import javax.xml.parsers.*;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

public class VulnerableApp {

    // --- Hardcoded secrets (do NOT do this) ---
    private static final String DB_URL  = "jdbc:h2:mem:testdb"; // Example in-memory DB
    private static final String DB_USER = "root";               // Hardcoded username
    private static final String DB_PASS = "password123";        // Hardcoded password / secret

    public static void main(String[] args) throws Exception {
        System.out.println("VulnerableApp started (FOR TESTING ONLY).");

        // Log sensitive information (leak)
        System.out.println("Leaked DB password (bad): " + DB_PASS);

        // Ensure we have some "untrusted" inputs
        String userId            = argOr(args, 0, "1 OR 1=1");          // SQL injection payload default
        String shellCommand      = argOr(args, 1, "echo vulnerable");   // Command injection
        String userProvidedPath  = argOr(args, 2, "../../etc/passwd");  // Path traversal
        String b64Serialized     = argOr(args, 3, defaultSerializedBase64());
        String xmlPayload        = argOr(args, 4, defaultXXE());

        // 1) SQL Injection (string concatenation)
        doSqlInjection(userId);

        // 2) Command Injection (Runtime.exec with untrusted input)
        doCommandInjection(shellCommand);

        // 3) Path Traversal (user-controlled file path)
        doPathTraversal(userProvidedPath);

        // 4) Insecure randomness (predictable tokens)
        generateWeakTokens();

        // 5) Weak cryptography (MD5 / SHA-1)
        doWeakCrypto("TopSecret!");

        // 6) Insecure SSL: trust-all + permissive hostname verification
        trustAllSslAndFetch("https://expired.badssl.com/");

        // 7) Insecure deserialization of untrusted data
        insecureDeserialize(b64Serialized);

        // 8) XXE enabled (allowing external entities)
        parseXmlWithXXE(xmlPayload);

        System.out.println("VulnerableApp finished (again: FOR TESTING ONLY).");
    }

    // --- Helpers -------------------------------------------------------------

    private static String argOr(String[] args, int idx, String fallback) {
        return (args != null && args.length > idx && args[idx] != null && !args[idx].isEmpty())
                ? args[idx]
                : fallback;
    }

    // 1) SQL Injection
    private static void doSqlInjection(String userId) {
        System.out.println("\n[SQL Injection] Using untrusted userId: " + userId);
        Connection conn = null;
        Statement stmt  = null;
        ResultSet rs    = null;
        try {
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            stmt = conn.createStatement();
            // Vulnerable: unparameterized SQL concatenation
            String sql = "SELECT * FROM USERS WHERE id = " + userId;
            System.out.println("Executing SQL (vulnerable): " + sql);
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                System.out.println("User row: " + rs.getString(1));
            }
        } catch (SQLException e) {
            System.out.println("Expected DB error (ok for testing): " + e.getMessage());
        } finally {
            // Not using try-with-resources (resource leak potential)
            try { if (rs != null) rs.close(); } catch (Exception ignore) {}
            try { if (stmt != null) stmt.close(); } catch (Exception ignore) {}
            try { if (conn != null) conn.close(); } catch (Exception ignore) {}
        }
    }

    // 2) Command Injection
    private static void doCommandInjection(String shellCommand) {
        System.out.println("\n[Command Injection] Executing untrusted command: " + shellCommand);
        try {
            // Vulnerable: concatenating user input into shell command
            String[] cmd = { "/bin/sh", "-c", shellCommand };
            Process p = Runtime.getRuntime().exec(cmd);
            // No safe quoting/whitelisting — intentionally vulnerable
            copy(p.getInputStream(), System.out);
            copy(p.getErrorStream(), System.err);
            p.waitFor();
        } catch (Exception e) {
            System.out.println("Command exec error: " + e.getMessage());
        }
    }

    // 3) Path Traversal
    private static void doPathTraversal(String untrustedPath) {
        System.out.println("\n[Path Traversal] Attempting to read: " + untrustedPath);
        File f = new File("/var/data/" + untrustedPath); // No validation; concatenation
        try (FileInputStream fis = new FileInputStream(f)) {
            byte[] buf = new byte[256];
            int r = fis.read(buf);
            System.out.println("Read bytes: " + r);
        } catch (Exception e) {
            System.out.println("File read error (expected in many envs): " + e.getMessage());
        }
    }

    // 4) Insecure Randomness
    private static void generateWeakTokens() {
        System.out.println("\n[Insecure Randomness] Generating predictable tokens:");
        Random rng = new Random(); // predictable seed if not specified
        for (int i = 0; i < 3; i++) {
            int token = rng.nextInt(); // predictable
            System.out.println("Weak token: " + token);
        }
    }

    // 5) Weak Cryptography
    private static void doWeakCrypto(String secret) {
        System.out.println("\n[Weak Crypto] Hashing with MD5 and SHA-1 (insecure)");
        try {
            MessageDigest md5 = MessageDigest.getInstance("MD5");    // weak
            byte[] md5Hash = md5.digest(secret.getBytes("UTF-8"));
            System.out.println("MD5(secret)  = " + bytesToHex(md5Hash));

            MessageDigest sha1 = MessageDigest.getInstance("SHA-1"); // weak
            byte[] sha1Hash = sha1.digest(secret.getBytes("UTF-8"));
            System.out.println("SHA1(secret) = " + bytesToHex(sha1Hash));
        } catch (Exception e) {
            System.out.println("Crypto error: " + e.getMessage());
        }
    }

    // 6) Insecure SSL: Trust all certs & hostnames
    private static void trustAllSslAndFetch(String url) {
        System.out.println("\n[Insecure SSL] Trusting all certificates and hostnames: " + url);
        try {
            TrustManager[] trustAll = new TrustManager[] {
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, trustAll, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true); // accept any hostname

            URL u = new URL(url);
            HttpsURLConnection conn = (HttpsURLConnection) u.openConnection();
            try (InputStream in = conn.getInputStream()) {
                // Just read some bytes
                byte[] buf = new byte[64];
                int n = in.read(buf);
                System.out.println("Fetched " + n + " bytes over insecure SSL.");
            }
        } catch (Exception e) {
            System.out.println("SSL fetch error: " + e.getMessage());
        }
    }

    // 7) Insecure Deserialization
    private static void insecureDeserialize(String base64Data) {
        System.out.println("\n[Insecure Deserialization] Base64 length: " + base64Data.length());
        try {
            byte[] data = Base64.getDecoder().decode(base64Data);
            ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
            Object obj = ois.readObject(); // Untrusted input
            System.out.println("Deserialized object type: " + (obj == null ? "null" : obj.getClass().getName()));
            // Intentionally not closing ois to hint at resource leak
        } catch (Exception e) {
            System.out.println("Deserialization error (expected): " + e.getMessage());
        }
    }

    // 8) XML External Entity (XXE)
    private static void parseXmlWithXXE(String xml) {
        System.out.println("\n[XXE] Parsing XML with external entities enabled");
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            // Intentionally permissive settings (do NOT do this)
            dbf.setExpandEntityReferences(true);
            // Do NOT disable DOCTYPE / external entities — intentionally unsafe
            // e.g., normally you'd do:
            // dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            // dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
            // dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new InputSource(new StringReader(xml)));
            System.out.println("Root element: " + doc.getDocumentElement().getNodeName());
        } catch (Exception e) {
            System.out.println("XML parse error (often expected): " + e.getMessage());
        }
    }

    // --- Utility methods -----------------------------------------------------

    private static void copy(InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[1024];
        int r;
        while ((r = in.read(buf)) != -1) {
            out.write(buf, 0, r);
        }
    }

    private static String bytesToHex(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (byte value : b) {
            sb.append(String.format("%02x", value));
        }
        return sb.toString();
    }

    // A default serialized payload (Base64) of a simple Java object (for demo)
    private static String defaultSerializedBase64() {
        // This is harmless placeholder data; scanners should still flag the insecure pattern.
        // It likely will fail to deserialize, which is fine for triggering the rule.
        return Base64.getEncoder().encodeToString("not-a-valid-serialized-object".getBytes());
    }

    // A minimal XXE payload attempting to read a local file (harmless in most sandboxes)
    private static String defaultXXE() {
        return ""
            + "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<!DOCTYPE foo [\n"
            + "  <!ELEMENT foo ANY >\n"
            + "  <!ENTITY xxe SYSTEM \"file:///etc/hostname\" >\n"
            + "]>\n"
            + "<foo>&xxe;</foo>";
    }
}
