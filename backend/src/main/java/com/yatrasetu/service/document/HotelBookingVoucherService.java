package com.yatrasetu.service.document;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.yatrasetu.domain.HotelBooking;
import com.yatrasetu.domain.HotelBookingStatus;
import com.yatrasetu.domain.HotelPaymentStatus;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class HotelBookingVoucherService {

    private static final Color BRAND_INDIGO = new Color(49, 46, 129);      // #312E81
    private static final Color BRAND_DARK = new Color(30, 41, 59);          // #1E293B
    private static final Color TEXT_MUTED = new Color(100, 116, 139);       // #64748B
    private static final Color BG_LIGHT = new Color(248, 250, 252);         // #F8FAFC
    private static final Color GREEN_CONFIRMED = new Color(22, 101, 52);    // #166534
    private static final Color GREEN_BG = new Color(240, 253, 244);         // #F0FDF4
    private static final Color BORDER_GRAY = new Color(226, 232, 240);      // #E2E8F0

    public byte[] generateBookingVoucherPdf(HotelBooking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CONFIRMED ||
                booking.getPaymentStatus() != HotelPaymentStatus.PAID) {
            throw new IllegalStateException("Confirmation voucher can only be generated for CONFIRMED and PAID bookings.");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BRAND_INDIGO);
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BRAND_DARK);
            Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BRAND_INDIGO);
            Font fontLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXT_MUTED);
            Font fontValue = FontFactory.getFont(FontFactory.HELVETICA, 10, BRAND_DARK);
            Font fontValueBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_DARK);
            Font fontStatus = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, GREEN_CONFIRMED);
            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, TEXT_MUTED);

            // 1. Header Table (Logo / Brand Name + Confirmation Reference)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});
            headerTable.setSpacingAfter(15);

            PdfPCell cellBrand = new PdfPCell();
            cellBrand.setBorder(Rectangle.NO_BORDER);
            cellBrand.addElement(new Paragraph("YATRASETU", fontBrand));
            cellBrand.addElement(new Paragraph("Unified Tourism & Hospitality Platform", fontLabel));
            headerTable.addCell(cellBrand);

            PdfPCell cellRef = new PdfPCell();
            cellRef.setBorder(Rectangle.NO_BORDER);
            cellRef.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pRef = new Paragraph("BOOKING VOUCHER", fontTitle);
            pRef.setAlignment(Element.ALIGN_RIGHT);
            cellRef.addElement(pRef);
            Paragraph pRefVal = new Paragraph("Ref: " + booking.getBookingReference(), fontValueBold);
            pRefVal.setAlignment(Element.ALIGN_RIGHT);
            cellRef.addElement(pRefVal);
            headerTable.addCell(cellRef);

            document.add(headerTable);

            // 2. Status Banner
            PdfPTable bannerTable = new PdfPTable(1);
            bannerTable.setWidthPercentage(100);
            bannerTable.setSpacingAfter(15);
            PdfPCell bannerCell = new PdfPCell();
            bannerCell.setBackgroundColor(GREEN_BG);
            bannerCell.setBorderColor(new Color(187, 247, 208));
            bannerCell.setPadding(10);
            Paragraph pBanner = new Paragraph("✓  STATUS: BOOKING CONFIRMED · PAYMENT VERIFIED (PAID)", fontStatus);
            pBanner.setAlignment(Element.ALIGN_CENTER);
            bannerCell.addElement(pBanner);
            bannerTable.addCell(bannerCell);
            document.add(bannerTable);

            // 3. Main Stay & Property Details Table
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.setWidthPercentage(100);
            mainTable.setWidths(new float[]{50, 50});
            mainTable.setSpacingAfter(15);

            // Left: Property & Guest
            PdfPCell cellLeft = new PdfPCell();
            cellLeft.setBorderColor(BORDER_GRAY);
            cellLeft.setBackgroundColor(BG_LIGHT);
            cellLeft.setPadding(10);

            cellLeft.addElement(new Paragraph("PROPERTY & GUEST DETAILS", fontSection));
            cellLeft.addElement(new Paragraph("Hotel Name:", fontLabel));
            cellLeft.addElement(new Paragraph(booking.getHotel().getHotelName(), fontValueBold));
            cellLeft.addElement(new Paragraph("Location:", fontLabel));
            String city = booking.getHotel().getCity() != null ? booking.getHotel().getCity().getCityName() : "";
            cellLeft.addElement(new Paragraph(booking.getHotel().getAddress() + (city.isBlank() ? "" : ", " + city), fontValue));
            cellLeft.addElement(new Paragraph("Guest Name:", fontLabel));
            cellLeft.addElement(new Paragraph(booking.getGuestName(), fontValueBold));
            cellLeft.addElement(new Paragraph("Guest Contact:", fontLabel));
            cellLeft.addElement(new Paragraph(booking.getGuestEmail() + " | " + booking.getGuestPhone(), fontValue));

            mainTable.addCell(cellLeft);

            // Right: Stay & Room
            PdfPCell cellRight = new PdfPCell();
            cellRight.setBorderColor(BORDER_GRAY);
            cellRight.setBackgroundColor(BG_LIGHT);
            cellRight.setPadding(10);

            cellRight.addElement(new Paragraph("RESERVATION SUMMARY", fontSection));
            cellRight.addElement(new Paragraph("Check-In Date:", fontLabel));
            cellRight.addElement(new Paragraph(booking.getCheckIn().format(DateTimeFormatter.ISO_LOCAL_DATE) + " (From 14:00)", fontValueBold));
            cellRight.addElement(new Paragraph("Check-Out Date:", fontLabel));
            cellRight.addElement(new Paragraph(booking.getCheckOut().format(DateTimeFormatter.ISO_LOCAL_DATE) + " (Until 11:00)", fontValueBold));
            cellRight.addElement(new Paragraph("Duration:", fontLabel));
            cellRight.addElement(new Paragraph(booking.getNumberOfNights() + " Night(s) · " + booking.getNumberOfRooms() + " Room(s)", fontValue));
            cellRight.addElement(new Paragraph("Room Type:", fontLabel));
            cellRight.addElement(new Paragraph(booking.getRoomType().getRoomTypeName(), fontValueBold));
            cellRight.addElement(new Paragraph("Rate Plan & Meal:", fontLabel));
            cellRight.addElement(new Paragraph(booking.getRatePlan().getPlanName() + " (" + (booking.getRatePlan().getMealPlan() != null ? booking.getRatePlan().getMealPlan().name() : "EP") + ")", fontValue));

            mainTable.addCell(cellRight);
            document.add(mainTable);

            // 4. Financial Snapshot Table
            PdfPTable priceTable = new PdfPTable(2);
            priceTable.setWidthPercentage(100);
            priceTable.setWidths(new float[]{70, 30});
            priceTable.setSpacingAfter(15);

            PdfPCell priceHeader = new PdfPCell(new Paragraph("FINANCIAL SNAPSHOT (IMMUTABLE TARIFF)", fontSection));
            priceHeader.setColspan(2);
            priceHeader.setBackgroundColor(BG_LIGHT);
            priceHeader.setBorderColor(BORDER_GRAY);
            priceHeader.setPadding(8);
            priceTable.addCell(priceHeader);

            addPriceRow(priceTable, "Base Room Subtotal (" + booking.getNumberOfRooms() + " room(s) x " + booking.getNumberOfNights() + " night(s)):",
                    "INR " + formatAmount(booking.getSubtotal()), fontValue, fontValue, BORDER_GRAY);

            addPriceRow(priceTable, "Taxes & Regulatory Fees:",
                    "INR " + formatAmount(booking.getTaxesAmount()), fontValue, fontValue, BORDER_GRAY);

            addPriceRow(priceTable, "Total Amount Paid (Payment Verified):",
                    "INR " + formatAmount(booking.getTotalAmount()), fontValueBold, fontValueBold, BORDER_GRAY);

            document.add(priceTable);

            // 5. Policy & Cancellation Terms
            PdfPTable policyTable = new PdfPTable(1);
            policyTable.setWidthPercentage(100);
            policyTable.setSpacingAfter(20);

            PdfPCell policyCell = new PdfPCell();
            policyCell.setBorderColor(BORDER_GRAY);
            policyCell.setPadding(10);
            policyCell.addElement(new Paragraph("CANCELLATION & PROPERTY POLICIES", fontSection));
            String policy = booking.getCancellationPolicySnapshot() != null ? booking.getCancellationPolicySnapshot() : "CANCELLATION_POLICY_UNAVAILABLE";
            Integer deadline = booking.getCancellationDeadlineHours() != null ? booking.getCancellationDeadlineHours() : 24;
            String policyDesc = "FREE_CANCELLATION".equalsIgnoreCase(policy)
                    ? "Free cancellation allowed up to " + deadline + " hours prior to standard check-in."
                    : "Standard booking policy: " + policy;
            policyCell.addElement(new Paragraph("• Policy: " + policyDesc, fontValue));
            policyCell.addElement(new Paragraph("• ID Verification: Primary guest must present a valid Government ID at check-in.", fontValue));
            policyCell.addElement(new Paragraph("• Pricing Disclosure: " + (booking.getTaxesAmount().compareTo(BigDecimal.ZERO) == 0
                    ? "Taxes and service fees are not configured in the baseline booking tariff."
                    : "All applicable charges included according to property rate plan."), fontValue));

            policyTable.addCell(policyCell);
            document.add(policyTable);

            // 6. Footer Note
            Paragraph footer = new Paragraph(
                    "This voucher is an authoritative booking document issued by YatraSetu Ecosystem. " +
                            "For booking modifications or support, please reference " + booking.getBookingReference() + " in your traveler dashboard.",
                    fontFooter);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate hotel booking voucher PDF: " + e.getMessage(), e);
        }
    }

    private void addPriceRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, Color borderColor) {
        PdfPCell cellLabel = new PdfPCell(new Paragraph(label, labelFont));
        cellLabel.setBorderColor(borderColor);
        cellLabel.setPadding(6);
        table.addCell(cellLabel);

        PdfPCell cellVal = new PdfPCell(new Paragraph(value, valueFont));
        cellVal.setBorderColor(borderColor);
        cellVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellVal.setPadding(6);
        table.addCell(cellVal);
    }

    private String formatAmount(BigDecimal amount) {
        return amount != null ? amount.setScale(2).toPlainString() : "0.00";
    }
}
