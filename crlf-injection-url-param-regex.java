import java.util.regex.Pattern;

public class CrlfInjectionUrlParamRegexTest {

    static final String[] TOKEN_NAMES = {"token", "access_token"};
    static final String[] PARAM_NAMES = {"token", "access_token"};

    // ===== MUST CATCH: raw + percent-encoded delimiters, value captured =====

    // The original construct under review.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern A = Pattern.compile("(\\?|%3F|&|%26)(" + String.join("|", TOKEN_NAMES) + ")" + "(%3D|=)([a-zA-Z\\d-.]*(==)*[a-zA-Z\\d.]*)*");

    // Same construct with a neutral constant name -- detection must not depend on naming.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern B = Pattern.compile("(\\?|%3F|&|%26)(" + String.join("|", PARAM_NAMES) + ")" + "(%3D|=)([a-zA-Z\\d-.]*(==)*[a-zA-Z\\d.]*)*");

    // Fully literal, no dynamic name list.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern C = Pattern.compile("(\\?|%3F)access_token(%3D|=)([^&%]*)");

    // Encoded ampersand rather than encoded question mark.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern D = Pattern.compile("(&|%26)api_key(%3D|=)([\\w-]+)");

    // Runtime, not a field.
    public void runtime() {
        // ruleid: crlf-injection-url-param-regex
        Pattern e = Pattern.compile("(\\?|%3F|&|%26)(session)(%3D|=)(.*)");
    }

    // ===== MUST NOT CATCH: no dual-encoding fingerprint =====

    // Plain query parsing with no percent-encoded delimiters. Out of scope for this
    // rule by design -- it is indistinguishable from ordinary parameter handling.
    // ok: crlf-injection-url-param-regex
    private static final Pattern F = Pattern.compile("token=([^&]*)");

    // ok: crlf-injection-url-param-regex
    private static final Pattern G = Pattern.compile("password=([^&]*)");

    // ok: crlf-injection-url-param-regex
    private static final Pattern H = Pattern.compile("email=([^&]*)");

    // Encoded equals only, no encoded separator -- e.g. base64 padding, not param parsing.
    // ok: crlf-injection-url-param-regex
    private static final Pattern I = Pattern.compile("([A-Za-z0-9+/]+(%3D)*)");

    // Percent-decoding helper that does not capture a parameter value.
    // ok: crlf-injection-url-param-regex
    private static final Pattern J = Pattern.compile("%[0-9A-Fa-f]{2}");

    // Ordinary metadata parameters.
    // ok: crlf-injection-url-param-regex
    private static final Pattern K = Pattern.compile("auth_method=(basic|oauth|saml)");

    // ok: crlf-injection-url-param-regex
    private static final Pattern L = Pattern.compile("lang=([a-z]{2})");

    // Helper name mentions token but the pattern itself is benign -- must not fire
    // on the identifier alone.
    static String getTokenPattern() { return "lang=([a-z]{2})"; }
    // ok: crlf-injection-url-param-regex
    private static final Pattern M = Pattern.compile(getTokenPattern());

    // ===== MUST CATCH: same fingerprint, reached a different way =====

    // Two-arg overload -- flags are common and must not hide the regex.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern N = Pattern.compile("(\\?|%3F|&|%26)(token)(%3D|=)([\\w-]*)", Pattern.CASE_INSENSITIVE);

    // Regex held in a String, compiled elsewhere. Flagged at the declaration:
    // metavariable-regex cannot see through constant propagation.
    // ruleid: crlf-injection-url-param-regex
    private static final String TOKEN_RE = "(\\?|%3F|&|%26)(token)(%3D|=)([\\w-]*)";
    private static final Pattern O = Pattern.compile(TOKEN_RE);

    // Never compiled at all -- String/Pattern APIs take the regex directly.
    public boolean viaMatches(String url) {
        // ruleid: crlf-injection-url-param-regex
        return url.matches("(\\?|%3F|&|%26)(token)(%3D|=)([\\w-]*)");
    }

    // Redaction. Benign intent, but still worth review per the rule message.
    public String redact(String url) {
        // ruleid: crlf-injection-url-param-regex
        return url.replaceAll("(\\?|%3F|&|%26)(token)(%3D|=)([\\w-]*)", "$1$2$3REDACTED");
    }

    public boolean viaPatternMatches(String url) {
        // ruleid: crlf-injection-url-param-regex
        return Pattern.matches("(\\?|%3F|&|%26)(token)(%3D|=)([\\w-]*)", url);
    }

    // Lowercase percent-encoding must not evade the rule.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern P = Pattern.compile("(\\?|%3f|&|%26)(token)(%3d|=)([\\w-]*)");

    // ===== MUST NOT CATCH: %3D present, but no encoded/raw alternation =====

    // Percent-decoding helper. The old rule flagged this; it is not extraction.
    // ok: crlf-injection-url-param-regex
    private static final Pattern Q = Pattern.compile("%3F|%26|%3D");

    // Encoded query-string fixture, not a parser.
    // ok: crlf-injection-url-param-regex
    static final String FIXTURE = "user%3Dalice%26page%3D2";

    // Encoded separator but raw '=' only -- out of scope by design.
    // ok: crlf-injection-url-param-regex
    private static final Pattern R = Pattern.compile("(\\?|%3F)access_token=([^&]*)");

    // Encoded '=' but raw separator only -- out of scope by design.
    // ok: crlf-injection-url-param-regex
    private static final Pattern S = Pattern.compile("[?&]access_token(%3D|=)([^&]*)");

    // ===== CRLF-specific: the client construct, and near neighbours =====

    // Exact shape the client shared: value captured by an allowlist class that
    // cannot express CR/LF, so a redaction pass truncates at an injected CRLF.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern CLIENT = Pattern.compile("(\\?|%3F|&|%26)(" + String.join("|", TOKEN_NAMES) + ")" + "(%3D|=)([a-zA-Z\\d-.]*(==)*[a-zA-Z\\d.]*)*");

    // The redaction sink that makes the gap exploitable.
    public String redactForLog(String url) {
        // ruleid: crlf-injection-url-param-regex
        return url.replaceAll("(\\?|%3F|&|%26)(token)(%3D|=)([a-zA-Z\\d-.]*)", "$1$2$3[REDACTED]");
    }

    // A class that does admit CR/LF still matches -- this rule flags the
    // construct, and the char class is for the reviewer to assess.
    // ruleid: crlf-injection-url-param-regex
    private static final Pattern PERMISSIVE = Pattern.compile("(\\?|%3F|&|%26)(token)(%3D|=)([\\s\\S]*)");
}
