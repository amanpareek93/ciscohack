package com.testapplication.sampleapp.service;

import com.testapplication.sampleapp.model.SensorData;
import com.testapplication.sampleapp.repo.DataServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataServiceImpl implements DataService {

    @Autowired
    private DataServiceRepository dataServiceRepository;

    @Override
    public List<SensorData> getDataByType(String type) {
        return dataServiceRepository.findByType(type);

    }

    @Override
    public SensorData save(SensorData sensorData) {
      return  dataServiceRepository.save(sensorData);
    }
}
