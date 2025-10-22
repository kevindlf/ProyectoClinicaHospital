package org.example.clinica.repository.mongo;

import org.example.clinica.model.mongo.Paciente;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PacienteRepository extends MongoRepository<Paciente, String> {
}