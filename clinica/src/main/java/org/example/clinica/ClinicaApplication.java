package org.example.clinica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
// 1. Forzamos a que encuentre los repositorios de PostgreSQL (JPA)
@EnableJpaRepositories(basePackages = "org.example.clinica.repository.postgres")
// 2. Forzamos a que encuentre los repositorios de MongoDB
@EnableMongoRepositories(basePackages = "org.example.clinica.repository.mongo")
public class ClinicaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicaApplication.class, args);

        System.out.println("🚀 Servidor backend clínico iniciado correctamente");
    }

}
