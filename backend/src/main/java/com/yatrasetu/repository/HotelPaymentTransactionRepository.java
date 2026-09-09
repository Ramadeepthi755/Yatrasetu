package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelPaymentStatus;
import com.yatrasetu.domain.HotelPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelPaymentTransactionRepository extends JpaRepository<HotelPaymentTransaction, String> {

    Optional<HotelPaymentTransaction> findByProviderOrderId(String providerOrderId);

    Optional<HotelPaymentTransaction> findByProviderPaymentId(String providerPaymentId);

    Optional<HotelPaymentTransaction> findByIdempotencyKey(String idempotencyKey);

    List<HotelPaymentTransaction> findByBookingIdOrderByCreatedAtDesc(String bookingId);

    List<HotelPaymentTransaction> findByBookingIdAndStatus(String bookingId, HotelPaymentStatus status);
}
