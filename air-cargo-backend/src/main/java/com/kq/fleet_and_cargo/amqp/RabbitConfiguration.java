package com.kq.fleet_and_cargo.amqp;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfiguration {

    @Value("${rabbitmq.queue.customer-whatsapp}")
    private String customerWhatsappQueue;

    @Value("${rabbitmq.queue.otp-email}")
    private String otpEmailQueue;

    @Value("${rabbitmq.exchanges.email}")
    private String emailExchange;

    @Value("${rabbitmq.routing-keys.customer-notification}")
    private String customerWhatsappRoutingKey;

    @Value("${rabbitmq.routing-keys.otp-notification}")
    private String otpEmailRoutingKey;

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(emailExchange);
    }

    @Bean
    public Queue customerWhatsappQueue() {
        return new Queue(customerWhatsappQueue, true);
    }

    @Bean
    public Queue otpEmailQueue() {
        return new Queue(otpEmailQueue, true);
    }

    @Bean
    public Binding customerWhatsappBinding() {
        return BindingBuilder.bind(customerWhatsappQueue()).to(topicExchange()).with(customerWhatsappRoutingKey);
    }

    @Bean
    public Binding otpEmailBinding() {
        return BindingBuilder.bind(otpEmailQueue()).to(topicExchange()).with(otpEmailRoutingKey);
    }
}
