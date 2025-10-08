package com.kq.fleet_and_cargo.services;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.zip.DataFormatException;

import java.util.function.Function;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kq.fleet_and_cargo.amqp.RabbitConfiguration;
import com.kq.fleet_and_cargo.amqp.RabbitMqProducer;
import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.events.CargoAddedEvent;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.CargoTrackingHistory;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.models.File;
import com.kq.fleet_and_cargo.payload.dto.CargoDto;
import com.kq.fleet_and_cargo.models.LuggageStatus;
import com.kq.fleet_and_cargo.models.Money;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.dto.WhatsappMessage;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
import com.kq.fleet_and_cargo.repositories.FXRateRepository;
import com.kq.fleet_and_cargo.repositories.LuggageStatusRepository;
import com.kq.fleet_and_cargo.utils.UserContext;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CargoService {

    private final CargoRepository cargoRepository;
    private final FileService fileService;
    private final CustomerRepository customerRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final RabbitMqProducer rabbitMqProducer;
    private final RabbitConfiguration rabbitConfiguration;
    private final UserContext userContext;
    private final CargoTrackingHistoryService cargoTrackingHistoryService;
    private final FXRateRepository fxRateRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${frontend-url}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public Page<Cargo> findAll(String search, int page, int size, String sortBy, String order,
            String startDate, String endDate, String pickupLocation, String destination) {
        log.info("Fetching all cargo");
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        String formattedSearch = search.replaceFirst("^\\+|^0+", "").trim();
        if (!startDate.isBlank() && !endDate.isBlank()) {
            ZonedDateTime start = ZonedDateTime.parse(startDate);
            ZonedDateTime end = ZonedDateTime.parse(endDate);
            return cargoRepository.findAllByDate(formattedSearch, start, end, pickupLocation, destination,
                    PageRequest.of(page, size, sort));
        }
        return cargoRepository.findAll(formattedSearch, pickupLocation, destination,
                PageRequest.of(page, size, sort));
    }

    @Transactional(readOnly = true)
    public Cargo findById(String id) {
        Cargo cargo = cargoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Luggage not found"));
        cargo.setPrice(cargo.getPrice().exchange(userContext.getUserFxRates(), true));
        return cargo;
    }

    private synchronized Long getNextReferenceNumber() {
        try {
            return jdbcTemplate.queryForObject("SELECT nextval('cargo_reference_seq')", Long.class);
        } catch (BadSqlGrammarException e) {
            if ("42P01".equals(e.getSQLException().getSQLState())) { // sequence missing
                jdbcTemplate.execute("CREATE SEQUENCE cargo_reference_seq");
                return jdbcTemplate.queryForObject("SELECT nextval('cargo_reference_seq')", Long.class);
            }
            throw e;
        }
    }

    public Cargo create(Cargo cargo, boolean sendWhatsapp) {
        log.info("Creating cargo");
        if (cargo.getReferenceNumber() == null) {
            cargo.setReferenceNumber(getNextReferenceNumber());
        }

        Customer sender = findOrSaveCustomer(cargo.getSender());
        Customer receiver = findOrSaveCustomer(cargo.getReceiver());
        cargo.setSender(sender);
        cargo.setReceiver(receiver);

        var price = cargo.getPrice();
        var currencyCode = userContext.getUserCurrencyCode();
        var fxRate = fxRateRepository.findByCurrencyCode(currencyCode)
                .orElseThrow(() -> new NotFoundException("Invalid currency type: " + currencyCode));
        Money money = new Money(price.getAmount(), currencyCode);
        cargo.setPrice(money.exchange(fxRate, false));

        Cargo saved = cargoRepository.save(cargo);

        if (sendWhatsapp) {
            sendCargoHelper(saved);
        }

        eventPublisher.publishEvent(new CargoAddedEvent(saved));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        CargoTrackingHistory history = CargoTrackingHistory.builder()
                .cargo(cargo)
                .updatedAt(ZonedDateTime.now())
                .createdBy(user)
                .history(List.of(LuggageStatus.builder().status(LuggageStatusEnum.PENDING).build()))
                .description("Cargo Received")
                .location(cargo.getPickupLocation())
                .build();
        cargoTrackingHistoryService.save(history);
        return saved;
    }

    @Transactional
    public Cargo update(Cargo cargo) {
        Cargo existing = findById(cargo.getId());
        existing.setWeight(cargo.getWeight());
        existing.setQuantity(cargo.getQuantity());
        existing.setDestination(cargo.getDestination());
        existing.setCargoType(cargo.getCargoType());
        existing.setPickupLocation(cargo.getPickupLocation());
        existing.setDestination(cargo.getDestination());
        existing.setDescription(cargo.getDescription());

        Customer receiver = findOrSaveCustomer(cargo.getReceiver());
        existing.setReceiver(receiver);

        var price = cargo.getPrice();
        var currencyCode = userContext.getUserCurrencyCode();
        var fxRate = fxRateRepository.findByCurrencyCode(currencyCode)
                .orElseThrow(() -> new NotFoundException("Invalid currency type: " + currencyCode));
        Money money = new Money(price.getAmount(), currencyCode);
        existing.setPrice(money.exchange(fxRate, false));

        return cargoRepository.save(existing);
    }

    public Customer findOrSaveCustomer(Customer customer) {
        Optional<Customer> existing = customerRepository.findByPhoneNumber(customer.getPhoneNumber());
        return existing.orElseGet(() -> customerRepository.save(customer));
    }

    public String delete(String id) {
        log.info("Deleting cargo with id: {}", id);
        Cargo cargo = cargoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Luggage not found"));
        cargoRepository.delete(cargo);
        return "Luggage deleted successfully";
    }

    @Transactional
    public String saveFile(String cargoId, MultipartFile logo) throws IOException {
        Cargo cargo = cargoRepository.findById(cargoId)
                .orElseThrow(() -> new NotFoundException("Cargo not found"));
        if (logo == null || logo.isEmpty()) {
            throw new IllegalArgumentException("File must be provided");
        }
        File file = fileService.saveFile(logo); // validates image type internally
        cargo.getFiles().add(file);
        cargoRepository.save(cargo);
        return "File with id %s saved successfully".formatted(file.getId());
    }

    @Transactional(readOnly = true)
    public List<File> getFiles(String cargoId) throws IOException, DataFormatException {
        List<File> files = cargoRepository.findById(cargoId)
                .orElseThrow(() -> new NotFoundException("Cargo not found"))
                .getFiles();

        // ✅ Build transient URLs without touching localPath/s3ObjectKey
        for (File f : files) {
            f.setFileUrl(fileService.buildPublicUrl(f));
        }
        return files;
    }

    public String deleteFile(String id) {
        fileService.deleteFile(id);
        return "File with id %s deleted.".formatted(id);
    }

    @Transactional(readOnly = true)
    public File getFile(String fileId) {
        // returns entity with fileUrl populated
        return fileService.getFile(fileId);
    }

    @Transactional(readOnly = true)
    public String sendCargoInfo(String cargoId) {
        Cargo cargo = findById(cargoId);
        return sendCargoHelper(cargo);
    }

    public String sendCargoHelper(Cargo cargo) {
        String message = """
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; background-color: #f0f8ff; padding: 20px; color: #333; }
                      .card { background-color: #e6f7ff; border: 1px solid #b3e0ff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,.1); }
                      .card h2 { color: #007acc; margin-top: 0; }
                      .card p { margin: 10px 0; font-size: 16px; }
                      .label { font-weight: bold; color: #005f8c; }
                    </style>
                  </head>
                  <body>
                    <div class="card">
                      <h2>🚚 Cargo Details</h2>
                      <p><span class="label">Weight:</span> %s</p>
                      <p><span class="label">Quantity:</span> %s</p>
                      <p><span class="label">Destination:</span> %s</p>
                      <p><span class="label">Cargo Type:</span> %s</p>
                      <p><span class="label">Pickup Location:</span> %s</p>
                      <p><span class="label">Description:</span> %s</p>
                    </div>
                    <a href="%s/track/%s" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#007acc;color:#fff;text-decoration:none;border-radius:5px;">View Cargo Details</a>
                  </body>
                </html>
                """
                .formatted(
                        cargo.getWeight(),
                        cargo.getQuantity(),
                        cargo.getDestination(),
                        cargo.getCargoType(),
                        cargo.getPickupLocation(),
                        cargo.getDescription(),
                        frontendUrl,
                        cargo.getId());

        rabbitMqProducer.sendWhatsappCustomer(
                WhatsappMessage.builder().message(message).to(cargo.getSender().getEmail()).build(),
                rabbitConfiguration.customerWhatsappBinding().getRoutingKey(),
                rabbitConfiguration.customerWhatsappBinding().getExchange());

        rabbitMqProducer.sendWhatsappCustomer(
                WhatsappMessage.builder().message(message).to(cargo.getReceiver().getEmail()).build(),
                rabbitConfiguration.customerWhatsappBinding().getRoutingKey(),
                rabbitConfiguration.customerWhatsappBinding().getExchange());

        return "Cargo info sent successfully to both sender and receiver";
    }
}
