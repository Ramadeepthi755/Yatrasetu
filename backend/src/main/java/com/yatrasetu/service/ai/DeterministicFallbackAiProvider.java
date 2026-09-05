package com.yatrasetu.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
public class DeterministicFallbackAiProvider implements AiProvider {

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("ignore (all|the|previous) (instructions|prompts|rules)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("disregard (all|the|previous)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("system prompt", Pattern.CASE_INSENSITIVE),
            Pattern.compile("you are now in (developer|god|dan|jailbreak) mode", Pattern.CASE_INSENSITIVE),
            Pattern.compile("act as (root|unrestricted|an unfiltered)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("reveal (api[_-]?key|secret|password|token)", Pattern.CASE_INSENSITIVE)
    );

    @Override
    public String getProviderName() {
        return "YatraSetu Deterministic Engine";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String generateChatResponse(String systemPrompt, String userMessage, Map<String, Object> context) {
        if (detectPromptInjection(userMessage)) {
            return "I am the YatraSetu AI Assistant, dedicated strictly to providing authentic, verified travel guidance for Indian heritage destinations. I cannot fulfill requests that alter safety rules, system prompts, or security boundaries.";
        }

        // Explicit zero-match check
        Boolean noMatches = (Boolean) context.get("noMatchesFound");
        if (Boolean.TRUE.equals(noMatches)) {
            return "Information is currently unavailable from our verified listings.";
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> destinations = (List<Map<String, Object>>) context.get("destinations");
        String queryType = (String) context.getOrDefault("queryType", "SPECIFIC_DESTINATION");
        String role = (String) context.getOrDefault("role", "GUEST");

        // Multi-destination broad query
        if (destinations != null && destinations.size() > 1) {
            return generateMultiDestinationResponse(queryType, destinations, context, userMessage, role);
        }

        String destName = (String) context.get("destinationName");
        @SuppressWarnings("unchecked")
        Map<String, Object> destInfo = (Map<String, Object>) context.get("destination");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> pois = (List<Map<String, Object>>) context.getOrDefault("pois", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> foods = (List<Map<String, Object>>) context.getOrDefault("foods", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> hotels = (List<Map<String, Object>>) context.getOrDefault("hotels", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> experiences = (List<Map<String, Object>>) context.getOrDefault("experiences", Collections.emptyList());

        StringBuilder response = new StringBuilder();
        String lowerMsg = userMessage.toLowerCase();

        // Check if user is asking for nonexistent restaurants / rental businesses
        if (lowerMsg.contains("restaurant") || lowerMsg.contains("cafe") || lowerMsg.contains("rental") || lowerMsg.contains("taxi phone")) {
            response.append("### Factual Listing Notice\n\n");
            response.append("In accordance with YatraSetu's **Zero-Hallucination Policy**, we only display verified partner listings and official data. We do not invent restaurant names, phone numbers, websites, or live taxi fares.\n\n");
            if (!foods.isEmpty()) {
                response.append("However, you can enjoy authentic regional culinary specialties curated from our heritage dataset:\n");
                for (Map<String, Object> food : foods.stream().limit(4).toList()) {
                    response.append(String.format("- **%s** (%s) — *Best places to try:* %s\n",
                            food.get("name"), food.get("type"), food.getOrDefault("bestPlaces", "Local heritage eateries")));
                }
                response.append("\n");
            }
            response.append("*Are you a local business owner? Register your establishment through the Local Partner portal to become a verified YatraSetu partner.*\n\n");
            return response.toString();
        }

        // Role-based response generation
        switch (role.toUpperCase()) {
            case "PARTNER" -> generatePartnerResponse(response, destName, destInfo, userMessage);
            case "GOVERNMENT" -> generateGovernmentResponse(response, destName, destInfo, pois, userMessage);
            case "TRAVELER" -> generateTravelerResponse(response, destName, destInfo, pois, foods, hotels, experiences, userMessage);
            default -> generateGuestResponse(response, destName, destInfo, pois, foods, userMessage);
        }

        return response.toString();
    }

    private void generateGuestResponse(StringBuilder sb, String destName, Map<String, Object> destInfo,
                                       List<Map<String, Object>> pois, List<Map<String, Object>> foods, String query) {
        if (destName != null && destInfo != null) {
            sb.append(String.format("### Welcome to %s Exploration!\n\n", destName));
            sb.append(String.format("%s\n\n", destInfo.getOrDefault("description", "A magnificent destination steeped in history and culture.")));
            sb.append(String.format("- **Best Time to Visit:** %s\n", destInfo.getOrDefault("bestTimeToVisit", "October to March")));
            sb.append(String.format("- **Ideal Duration:** %s days\n\n", destInfo.getOrDefault("idealDurationDays", "3")));

            if (!pois.isEmpty()) {
                sb.append("#### Must-Visit Verified Heritage Points of Interest:\n");
                for (Map<String, Object> poi : pois.stream().limit(5).toList()) {
                    sb.append(String.format("- **%s** (%s) — Duration: ~%s hrs | Entry Fee: %s\n",
                            poi.get("name"), poi.get("category"), poi.get("typicalDurationHours"),
                            formatFee(poi.get("entryFeeInr"))));
                }
                sb.append("\n");
            }

            if (!foods.isEmpty()) {
                sb.append("#### Authentic Regional Dishes:\n");
                for (Map<String, Object> f : foods.stream().limit(3).toList()) {
                    sb.append(String.format("- **%s** (%s)\n", f.get("name"), f.get("type")));
                }
                sb.append("\n");
            }

            sb.append("> **Guest Tip:** You are browsing as a Guest. Sign in with your YatraSetu account to unlock the **Smart AI Trip Planner**, save personalized itineraries to My Trips, and connect with verified local hosts!\n");
        } else {
            sb.append("### Welcome to YatraSetu!\n\n");
            sb.append("I am your verified AI travel assistant. I can help you explore over 90+ curated Indian heritage destinations, discover authentic regional cuisine, plan verified itineraries, and connect with trusted local experts.\n\n");
            sb.append("Where would you like to travel next? You can ask me about destinations like **Hampi**, **Jaipur**, **Goa**, **Varanasi**, or browse our Explore catalogue.\n\n");
            sb.append("> *Sign in to save your custom trips and access traveler connect features.*\n");
        }
    }

    private void generateTravelerResponse(StringBuilder sb, String destName, Map<String, Object> destInfo,
                                         List<Map<String, Object>> pois, List<Map<String, Object>> foods,
                                         List<Map<String, Object>> hotels, List<Map<String, Object>> experiences, String query) {
        if (destName != null && destInfo != null) {
            sb.append(String.format("### Travel Guide: %s\n\n", destName));
            sb.append(String.format("%s\n\n", destInfo.getOrDefault("description", "")));
            sb.append(String.format("📍 **Location:** %s, %s | ⏱ **Recommended Time:** %s days\n\n",
                    destInfo.getOrDefault("city", ""), destInfo.getOrDefault("state", ""), destInfo.getOrDefault("idealDurationDays", "3")));

            if (!pois.isEmpty()) {
                sb.append("#### Key Verified POIs for Your Itinerary:\n");
                for (Map<String, Object> poi : pois.stream().limit(6).toList()) {
                    sb.append(String.format("1. **%s** (`%s`)\n   - *Category:* %s | *Typical Time:* %s hrs | *Entry:* %s\n",
                            poi.get("name"), poi.get("id"), poi.get("category"), poi.get("typicalDurationHours"),
                            formatFee(poi.get("entryFeeInr"))));
                }
                sb.append("\n");
            }

            if (!foods.isEmpty()) {
                sb.append("#### Authentic Cuisine to Taste:\n");
                for (Map<String, Object> food : foods.stream().limit(4).toList()) {
                    sb.append(String.format("- **%s** (%s) — *Try at:* %s\n",
                            food.get("name"), food.get("type"), food.getOrDefault("bestPlaces", "Traditional heritage spots")));
                }
                sb.append("\n");
            }

            if (!experiences.isEmpty()) {
                sb.append("#### Recommended Community Experiences:\n");
                for (Map<String, Object> exp : experiences.stream().limit(3).toList()) {
                    sb.append(String.format("- **%s** — ₹%s (%s hrs)\n",
                            exp.get("title"), exp.get("priceInr"), exp.get("durationHours")));
                }
                sb.append("\n");
            }

            sb.append("💡 **Ready to Plan?** Click **\"Plan Trip\"** in the Smart Trip Planner to generate an optimized day-by-day itinerary with verified POI IDs and a transparent budget breakdown!\n");
        } else {
            sb.append("### Hello Fellow Traveler!\n\n");
            sb.append("I am ready to help you plan your journey. Ask me about:\n");
            sb.append("- Day-by-day itineraries for any of our 93 curated destinations\n");
            sb.append("- Verified entry fees and realistic budget breakdowns\n");
            sb.append("- Authentic local dishes and cultural customs\n");
            sb.append("- Weather guidance and optimal visiting hours\n");
        }
    }

    private void generatePartnerResponse(StringBuilder sb, String destName, Map<String, Object> destInfo, String query) {
        sb.append("### Local Partner Advisory Portal\n\n");
        sb.append("Welcome! As a valued YatraSetu Local Partner, here is the guidance tailored for your role:\n\n");
        if (destName != null) {
            sb.append(String.format("#### Destination Focus: %s\n", destName));
            sb.append("- Ensure your host profile, heritage walks, or cultural stays are fully updated with genuine descriptions.\n");
            sb.append("- Maintain high quality standards: Only profiles with complete government ID verification and partner audits receive the **\"Verified Partner\"** badge.\n");
            sb.append("- Zero-fabrication reminder: Please provide accurate pricing and inclusions to maintain traveler trust.\n\n");
        }
        sb.append("#### Partner Best Practices:\n");
        sb.append("1. **Experience Listings:** Detail group size limits, equipment provided, and cancellation terms.\n");
        sb.append("2. **Local Guidelines:** Educate travelers on monument conservation, photography permissions, and temple etiquette.\n");
        sb.append("3. **Compliance:** Ensure all local permits, licensing, and vehicle fitness certificates are current.\n");
    }

    private void generateGovernmentResponse(StringBuilder sb, String destName, Map<String, Object> destInfo,
                                            List<Map<String, Object>> pois, String query) {
        sb.append("### Tourism Administration & Policy Insights\n\n");
        sb.append("YatraSetu Government Operations Dashboard Assistant:\n\n");
        if (destName != null) {
            sb.append(String.format("#### Regional Heritage Profile: %s\n", destName));
            sb.append(String.format("- **Managed POIs in Dataset:** %d registered monuments and attractions.\n", pois.size()));
            sb.append(String.format("- **Conservation Priority:** Balanced footfall distribution across peak and off-peak visiting windows.\n"));
            sb.append("- **Verification Standards:** Only audited tourism operators receive platform endorsement.\n\n");
        }
        sb.append("#### Key Strategic Focus Areas:\n");
        sb.append("1. **Sustainable Tourism:** Managing visitor carrying capacity at ASI protected sites.\n");
        sb.append("2. **Economic Dispersal:** Encouraging travelers to visit secondary heritage nodes and patronize local culinary artisans.\n");
        sb.append("3. **Data Integrity:** Real-time alignment with official state tourism portals and safety directives.\n");
    }

    private String generateMultiDestinationResponse(String queryType, List<Map<String, Object>> destinations,
                                                     Map<String, Object> context, String userMessage, String role) {
        StringBuilder sb = new StringBuilder();

        switch (queryType) {
            case "STATE_SEARCH" -> {
                String stateName = (String) context.getOrDefault("matchedState", "the requested state");
                sb.append(String.format("### Verified Heritage Destinations in %s\n\n", stateName));
                sb.append(String.format("Based on YatraSetu's verified dataset, here are destinations you can explore in **%s**:\n\n", stateName));
                int idx = 1;
                for (Map<String, Object> d : destinations) {
                    sb.append(String.format("%d. **%s**\n", idx++, d.get("name")));
                    if (d.get("description") != null) {
                        sb.append(String.format("   - *Overview:* %s\n", d.get("description")));
                    }
                    sb.append(String.format("   - *Verified Best Season:* %s | *Ideal Duration:* %s days\n",
                            d.getOrDefault("bestTimeToVisit", "October to March"), d.getOrDefault("idealDurationDays", "3")));
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> pois = (List<Map<String, Object>>) d.get("pois");
                    if (pois != null && !pois.isEmpty()) {
                        String poiStr = pois.stream()
                                .map(p -> String.format("%s (%s, %s)", p.get("name"), p.get("category"), formatFee(p.get("entryFeeInr"))))
                                .collect(Collectors.joining(", "));
                        sb.append(String.format("   - *Verified POIs:* %s\n", poiStr));
                    }
                    sb.append("\n");
                }
            }
            case "SEASONAL_HERITAGE_SEARCH", "SEASONAL_SEARCH" -> {
                String currentMonth = (String) context.getOrDefault("currentMonth", "Current Season");
                sb.append(String.format("### Best Verified Heritage Destinations for %s\n\n", currentMonth));
                sb.append(String.format("Based on YatraSetu's verified seasonal guides and climate patterns for **%s**, here are top recommendations:\n\n", currentMonth));
                int idx = 1;
                for (Map<String, Object> d : destinations) {
                    sb.append(String.format("%d. **%s** (%s)\n", idx++, d.get("name"), d.get("state")));
                    if (d.get("description") != null) {
                        sb.append(String.format("   - *Highlights:* %s\n", d.get("description")));
                    }
                    sb.append(String.format("   - *Seasonal Window:* %s | *Ideal Duration:* %s days\n",
                            d.getOrDefault("bestTimeToVisit", "October to March"), d.getOrDefault("idealDurationDays", "3")));
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> pois = (List<Map<String, Object>>) d.get("pois");
                    if (pois != null && !pois.isEmpty()) {
                        String poiStr = pois.stream()
                                .map(p -> String.format("%s (%s, %s)", p.get("name"), p.get("category"), formatFee(p.get("entryFeeInr"))))
                                .collect(Collectors.joining(", "));
                        sb.append(String.format("   - *Verified POIs:* %s\n", poiStr));
                    }
                    sb.append("\n");
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> weather = (Map<String, Object>) context.get("weather");
                if (weather != null && !destinations.isEmpty()) {
                    String topDestName = (String) destinations.get(0).get("name");
                    sb.append(String.format("#### Live Weather Spotlight (%s):\n", topDestName));
                    sb.append(String.format("- **Current Conditions:** %s°C, %s (Source: %s)\n",
                            weather.get("temperatureC"), weather.get("condition"), weather.get("source")));
                    if (weather.get("advice") != null) {
                        sb.append(String.format("- *Travel Advice:* %s\n\n", weather.get("advice")));
                    }
                }
            }
            case "CATEGORY_SEARCH" -> {
                String title = (String) context.getOrDefault("categoryTitle", "Curated");
                sb.append(String.format("### Verified %s Destinations\n\n", title));
                sb.append("Here are verified destinations from our Indian heritage catalog:\n\n");
                int idx = 1;
                for (Map<String, Object> d : destinations) {
                    sb.append(String.format("%d. **%s** (%s)\n", idx++, d.get("name"), d.get("state")));
                    if (d.get("description") != null) {
                        sb.append(String.format("   - *Overview:* %s\n", d.get("description")));
                    }
                    if (d.get("hiddenGems") != null && !((String) d.get("hiddenGems")).trim().isEmpty()) {
                        sb.append(String.format("   - *Verified Hidden Gems:* %s\n", d.get("hiddenGems")));
                    }
                    sb.append(String.format("   - *Best Time to Visit:* %s | *Ideal Duration:* %s days\n",
                            d.getOrDefault("bestTimeToVisit", "October to March"), d.getOrDefault("idealDurationDays", "3")));
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> pois = (List<Map<String, Object>>) d.get("pois");
                    if (pois != null && !pois.isEmpty()) {
                        String poiStr = pois.stream()
                                .map(p -> String.format("%s (%s)", p.get("name"), p.get("category")))
                                .collect(Collectors.joining(", "));
                        sb.append(String.format("   - *Key POIs:* %s\n", poiStr));
                    }
                    sb.append("\n");
                }
            }
            default -> {
                sb.append("### Verified Destinations Matching Your Query\n\n");
                sb.append("Here are matching verified destinations from YatraSetu:\n\n");
                int idx = 1;
                for (Map<String, Object> d : destinations) {
                    sb.append(String.format("%d. **%s** (%s) — %s\n", idx++, d.get("name"), d.get("state"),
                            d.getOrDefault("bestTimeToVisit", "October to March")));
                }
                sb.append("\n");
            }
        }

        sb.append("> **YatraSetu Heritage Tip:** Select any destination card below to explore verified local homestays, licensed heritage guides, and generate custom trip itineraries.\n");
        return sb.toString();
    }

    private String formatFee(Object fee) {
        if (fee == null) return "Free / Public";
        try {
            double val = Double.parseDouble(fee.toString());
            if (val <= 0) return "Free entry";
            return String.format("₹%.0f", val);
        } catch (Exception e) {
            return "Price unavailable";
        }
    }

    @Override
    public String generateItineraryJson(String systemPrompt, String userPrompt) {
        // Fallback for direct JSON generation when LLM is unavailable
        return "{}";
    }

    private boolean detectPromptInjection(String input) {
        if (input == null) return false;
        for (Pattern p : INJECTION_PATTERNS) {
            if (p.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }
}
