package com.testapplication.sampleapp.service;

import com.testapplication.sampleapp.model.SensorData;

import java.util.List;

public interface DataService {
    public List<SensorData> getDataByType(String type);
    public SensorData save(SensorData sensorData);
}
