package com.yatrasetu.service;

import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.CulturalTradition;
import com.yatrasetu.repository.CulturalTraditionRepository;
import com.yatrasetu.web.dto.CulturalTraditionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CulturalTraditionService {

    private final CulturalTraditionRepository culturalTraditionRepository;

    @Transactional(readOnly = true)
    public Page<CulturalTraditionDto> getAllTraditions(
            String stateId,
            String cityId,
            String destinationId,
            String category,
            String search,
            Pageable pageable) {

        String cleanedState = (stateId != null && !stateId.trim().isEmpty() && !stateId.equalsIgnoreCase("all")) ? stateId.trim() : null;
        String cleanedCity = (cityId != null && !cityId.trim().isEmpty() && !cityId.equalsIgnoreCase("all")) ? cityId.trim() : null;
        String cleanedDest = (destinationId != null && !destinationId.trim().isEmpty() && !destinationId.equalsIgnoreCase("all")) ? destinationId.trim() : null;
        String cleanedCat = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) ? category.trim() : null;
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return culturalTraditionRepository.findWithFilters(
                cleanedState,
                cleanedCity,
                cleanedDest,
                cleanedCat,
                cleanedSearch,
                pageable
        ).map(CulturalTraditionDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public CulturalTraditionDto getTraditionById(String id) {
        return culturalTraditionRepository.findById(id)
                .map(CulturalTraditionDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Cultural tradition not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<CulturalTraditionDto> getTraditionsByState(String stateId) {
        return culturalTraditionRepository.findByStateIdAndIsActiveTrue(stateId)
                .stream()
                .map(CulturalTraditionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CulturalTraditionDto> getTraditionsByDestination(String destinationId) {
        return culturalTraditionRepository.findByDestinationIdAndIsActiveTrue(destinationId)
                .stream()
                .map(CulturalTraditionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return culturalTraditionRepository.findDistinctCategories();
    }
}
