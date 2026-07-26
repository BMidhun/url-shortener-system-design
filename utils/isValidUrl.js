/* 

Attackers love to pass internal URLs (like http://localhost:8080/admin 
or cloud resource endpoints http://169.254.169.254) 
into URL shorteners to trick the server into accessing its own internal network. 
This is called Server-Side Request Forgery (SSRF). We can prevent this by adding these
internal network in the blacklistedHosts.

*/

function isValidHttpUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Block internal loopbacks and local addresses
    const blacklistedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      // add any cloud services
    ];

    if (
      blacklistedHosts.includes(hostname) ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    ) {
      return false;
    }

    // Ensure it uses standard web protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return true;
  } catch (error) {
    return false; // Invalid URL structure caught by JS URL class
  }
}

module.exports = { isValidHttpUrl };
