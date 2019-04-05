package com.testapplication.sampleapp;

public class Car {

	public String carname;

	@Override
	public String toString() {
		return "Car [carname=" + carname + "]";
	}

	public String getCarname() {
		return carname;
	}

	public void setCarname(String carname) {
		this.carname = carname;
	}
}
