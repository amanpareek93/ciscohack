package com.testapplication.sampleapp.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class SensorData {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private Long timestamp;
    private Long value;

    @Override
    public String toString() {
        return "SensorData{" +
                "id=" + id +
                ", timestamp=" + timestamp +
                ", value=" + value +
                ", key='" + key + '\'' +
                '}';
    }

    private String key;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}