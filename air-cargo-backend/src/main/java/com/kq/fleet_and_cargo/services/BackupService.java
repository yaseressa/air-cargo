package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.enums.UserRoles;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.repositories.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BackupService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2 AM
    public void backupDatabase() {
        try {
            String backupFile = "/home/user/backups/backup_" + LocalDate.now() + ".sql";
            ProcessBuilder pb = new ProcessBuilder(
                    "pg_dump",
                    "-h", "ep-little-cake-a56v6iek-pooler.us-east-2.aws.neon.tech",
                    "-U", dbUser,
                    "-d", "neondb",
                    "-F", "c",
                    "-f", backupFile
            );
            pb.environment().put("PGPASSWORD", dbPassword);
            Process process = pb.start();
            process.waitFor();

            sendBackupEmail(backupFile);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendBackupEmail(String filePath) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        List<User> users = userRepository.findAllByRole(UserRoles.ADMIN);
        for (User user : users) {
            helper.addTo(user.getEmail());
        }

        helper.setSubject("Database Backup - " + LocalDate.now());
        helper.setText("Attached is the latest backup of the database.");

        FileSystemResource file = new FileSystemResource(new File(filePath));
        helper.addAttachment("backup.sql", file);

        mailSender.send(message);
    }
}
