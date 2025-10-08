package com.kq.fleet_and_cargo.services;

import java.time.LocalDate;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.kq.fleet_and_cargo.payload.dto.WhatsappMessage;
import com.kq.fleet_and_cargo.utils.PathConstructUtil;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class EmailSenderService {

    private final JavaMailSender emailSender;
    private final PathConstructUtil pathConstructUtil;
    private final WhatsappSenderService whatsappSenderService;

    @RabbitListener(queues = "${rabbitmq.queue.otp-email}")
    public void sendOTP(String content) {
        log.info("Sending OTP to email: {}", content.split(":")[0]);
        String email = content.split(":")[0];
        String Otp = content.split(":")[1];
        String otpTemplate =
                "<html><body>" +
                        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin: 0; padding: 0;\">" +
                        "  <tr>" +
                        "    <td align=\"center\" style=\"padding: 20px 0;\">" +
                        "      <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">" +
                        "        <tr>" +
                        "          <td style=\"background-color: hsl(359.47, 96.61%, 46.27%); padding: 20px; text-align: center;\">" +
                        "            <h1 style=\"color: #ffffff; margin: 0;\">Your OTP Code</h1>" +
                        "          </td>" +
                        "        </tr>" +
                        "        <tr>" +
                        "          <td style=\"padding: 20px;\">" +
                        "            <p style=\"font-size: 16px; line-height: 1.6;\">Your One-Time Password (OTP) for verification is:</p>" +
                        "            <p style=\"font-size: 24px; font-weight: bold; text-align: center;\">" + Otp + "</p>" +
                        "            <p style=\"font-size: 16px; line-height: 1.6;\">Please enter this code in the app/website to proceed. This OTP is valid for the next 10 minutes.</p>" +
                        "            <p style=\"font-size: 16px; line-height: 1.6;\">If you did not request this, please ignore this email.</p>" +
                        "          </td>" +
                        "        </tr>" +
                        "        <tr>" +
                        "          <td style=\"background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #999999;\">" +
                        "            <p style=\"margin: 0;\">&copy; " + LocalDate.now().getYear() + " Dhaqane. All rights reserved.</p>" +
                        "          </td>" +
                        "        </tr>" +
                        "      </table>" +
                        "    </td>" +
                        "  </tr>" +
                        "</table>" +
                        "</body></html>";

        try {

            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setFrom("Sahan@gmail.com");
            helper.setTo(email.trim());
            helper.setSubject("no-reply - Sahan");
            helper.setText(otpTemplate, true);

            emailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.customer-whatsapp}")
    public void sendCustomerNotification(WhatsappMessage whatsappMessage) {
        try {
            log.info("Sending customer notification to {}: {}", whatsappMessage.getTo(), whatsappMessage.getMessage());
            StringBuilder messageBuilder = new StringBuilder();
            messageBuilder.append("<html><body>")
                    .append("<h2>Customer Notification</h2>")
                    .append("<p>").append(whatsappMessage.getMessage()).append("</p>");


            messageBuilder.append("<p style=\"font-size: 12px; color: #888;\">&copy; ")
                    .append(LocalDate.now().getYear())
                    .append(" Sahan. All rights reserved.</p>")
                    .append("</body></html>");

            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setFrom("Sahan@gmail.com");
            helper.setTo(whatsappMessage.getTo());
            helper.setSubject("Customer Notification - Sahan");
            helper.setText(messageBuilder.toString(), true);

            emailSender.send(mimeMessage);

            log.info("✅ Email sent to {}: {}", whatsappMessage.getTo(), whatsappMessage.getMessage());
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", whatsappMessage.getTo(), e.getMessage(), e);
        }
    }
}
