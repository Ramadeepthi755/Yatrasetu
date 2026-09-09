package com.yatrasetu.repository;

import com.yatrasetu.domain.ExperienceSupportingProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceSupportingProviderRepository extends JpaRepository<ExperienceSupportingProvider, String> {
    List<ExperienceSupportingProvider> findByExperienceId(String experienceId);
    List<ExperienceSupportingProvider> findByProviderId(String providerId);

    @org.springframework.data.jpa.repository.Query("SELECT sp FROM ExperienceSupportingProvider sp WHERE sp.providerId = :providerId OR sp.providerName = :providerName ORDER BY sp.createdAt DESC")
    List<ExperienceSupportingProvider> findByProviderIdOrName(@org.springframework.data.repository.query.Param("providerId") String providerId, @org.springframework.data.repository.query.Param("providerName") String providerName);
}
