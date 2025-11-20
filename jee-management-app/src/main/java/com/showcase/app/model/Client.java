package com.showcase.app.model;

public class Client {

    private final long id;
    private final String name;
    private final String city;
    private final String sector;
    private final String status;
    private final int activeProjects;

    public Client(long id, String name, String city, String sector, String status, int activeProjects) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.sector = sector;
        this.status = status;
        this.activeProjects = activeProjects;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getSector() {
        return sector;
    }

    public String getStatus() {
        return status;
    }

    public int getActiveProjects() {
        return activeProjects;
    }

    public boolean isActive() {
        return "active".equals(status);
    }
}

