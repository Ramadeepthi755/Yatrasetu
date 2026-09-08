package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.repository.intelligence.TourismRedistributionRecommendationRepository;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.RedistributionRecommendationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourismRedistributionService {

    private final TourismRedistributionRecommendationRepository recommendationRepository;
    private final TourismGovernmentActionRepository actionRepository;
    private final DestinationHealthService healthService;

    private static final String LIMITATIONS_TEXT =
            "Recommendations are algorithmic pairing suggestions based on destination category similarity, " +
            "activity pressure differentials, and local ecosystem capacity. They represent potential demand diversification opportunities, not guaranteed travel shifts.";

    @Transactional(readOnly = true)
    public List<RedistributionRecommendationDto> getActiveRecommendations(boolean includeDemo) {
        List<TourismRedistributionRecommendation> list = recommendationRepository.findByStatusOrderByConfidenceScoreDesc(RecommendationStatus.ACTIVE);
        List<RedistributionRecommendationDto> dtoList = new ArrayList<>();

        for (TourismRedistributionRecommendation rec : list) {
            DestinationHealthDto sourceHealth = healthService.calculateHealth(rec.getSourceDestination().getId(), includeDemo);
            DestinationHealthDto targetHealth = healthService.calculateHealth(rec.getTargetDestination().getId(), includeDemo);

            BigDecimal sourcePressure = sourceHealth != null ? sourceHealth.getActivityPressureScore() : BigDecimal.ZERO;
            BigDecimal targetOpportunity = targetHealth != null ? targetHealth.getLocalOpportunityScore() : BigDecimal.ZERO;
            BigDecimal targetPressure = targetHealth != null ? targetHealth.getActivityPressureScore() : BigDecimal.ZERO;

            dtoList.add(RedistributionRecommendationDto.builder()
                    .id(rec.getId())
                    .sourceDestinationId(rec.getSourceDestination().getId())
                    .sourceDestinationName(rec.getSourceDestination().getDestinationName())
                    .sourceActivityPressureScore(sourcePressure)
                    .targetDestinationId(rec.getTargetDestination().getId())
                    .targetDestinationName(rec.getTargetDestination().getDestinationName())
                    .targetLocalOpportunityScore(targetOpportunity)
                    .targetActivityPressureScore(targetPressure)
                    .compatibilityType(rec.getCompatibilityType())
                    .reason(rec.getReason())
                    .expectedPotentialBenefit(rec.getExpectedPotentialBenefit())
                    .confidenceScore(rec.getConfidenceScore())
                    .priority(rec.getPriority())
                    .status(rec.getStatus())
                    .sourceType(rec.getSourceType())
                    .whyExplanation(String.format(
                            "Why recommend %s? Lower observed activity pressure (%s vs %s in %s) and active local ecosystem (%s opportunity score).",
                            rec.getTargetDestination().getDestinationName(), targetPressure, sourcePressure, rec.getSourceDestination().getDestinationName(), targetOpportunity
                    ))
                    .limitations(LIMITATIONS_TEXT)
                    .build());
        }

        return dtoList;
    }

    @Transactional
    public boolean reviewRecommendation(String recommendationId, String notes, User user) {
        TourismRedistributionRecommendation rec = recommendationRepository.findById(recommendationId).orElse(null);
        if (rec == null) return false;

        rec.setStatus(RecommendationStatus.REVIEWED);
        recommendationRepository.save(rec);

        TourismGovernmentAction action = TourismGovernmentAction.builder()
                .id("act-" + UUID.randomUUID())
                .destination(rec.getSourceDestination())
                .recommendation(rec)
                .actionType(GovernmentActionType.REVIEW_RECOMMENDATION)
                .title("Reviewed Redistribution Opportunity: " + rec.getSourceDestination().getDestinationName() + " -> " + rec.getTargetDestination().getDestinationName())
                .notes(notes != null ? notes : "Recommendation verified and acknowledged by government official.")
                .user(user)
                .build();

        actionRepository.save(action);
        log.info("Government user {} marked recommendation {} as REVIEWED", user != null ? user.getId() : "system", recommendationId);
        return true;
    }
}
