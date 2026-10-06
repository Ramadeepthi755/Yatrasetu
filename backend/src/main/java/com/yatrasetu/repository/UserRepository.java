package com.yatrasetu.repository;

import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByAuthUserId(String authUserId);
    Optional<User> findByFullName(String fullName);
    long countByRole(Role role);
    long countByVerificationStatus(VerificationStatus status);
}

