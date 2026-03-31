package com.aishop.util;

public class UserAgentParser {

    public static String parseDeviceInfo(String userAgent) {
        if (userAgent == null) return "Unknown Device";

        String ua = userAgent.toLowerCase();

        // Detect platform
        String platform = "Unknown";
        if (ua.contains("windows")) platform = "Windows";
        else if (ua.contains("macintosh") || ua.contains("mac os")) platform = "macOS";
        else if (ua.contains("linux")) platform = "Linux";
        else if (ua.contains("android")) platform = "Android";
        else if (ua.contains("iphone") || ua.contains("ipad")) platform = "iOS";

        // Detect browser
        String browser = "Unknown";
        if (ua.contains("chrome") && !ua.contains("edg")) browser = "Chrome";
        else if (ua.contains("firefox")) browser = "Firefox";
        else if (ua.contains("safari") && !ua.contains("chrome")) browser = "Safari";
        else if (ua.contains("edg") || ua.contains("edge")) browser = "Edge";
        else if (ua.contains("opr") || ua.contains("opera")) browser = "Opera";

        return browser + " on " + platform;
    }

    /**
     * Extract platform slug for UI icons
     */
    public static String parsePlatform(String userAgent) {
        if (userAgent == null) return "unknown";

        String ua = userAgent.toLowerCase();
        if (ua.contains("chrome") && !ua.contains("edg")) return "chrome";
        if (ua.contains("firefox")) return "firefox";
        if (ua.contains("safari") && !ua.contains("chrome")) return "safari";
        if (ua.contains("edg") || ua.contains("edge")) return "edge";
        if (ua.contains("android")) return "android";
        if (ua.contains("iphone") || ua.contains("ipad")) return "ios";

        return "unknown";
    }

    /**
     * Mask endpoint URL for privacy (show last 8 chars)
     */
    public static String maskEndpoint(String endpoint) {
        if (endpoint == null || endpoint.length() <= 12) return "****";
        return endpoint.substring(0, 25) + "..." + endpoint.substring(endpoint.length() - 8);
    }
}