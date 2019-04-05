package com.testapplication.sampleapp.repo;

import com.testapplication.sampleapp.model.SensorData;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Repository
public interface DataServiceRepository extends CrudRepository<SensorData, Long> {

    List<SensorData> findByType(String lastName);
}