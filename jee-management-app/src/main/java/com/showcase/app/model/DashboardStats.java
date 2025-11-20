package com.showcase.app.model;

public class DashboardStats {

    private final int totalClients;
    private final int activeClients;
    private final int inactiveClients;
    private final int totalProjects;

    public DashboardStats(int totalClients, int activeClients, int inactiveClients, int totalProjects) {
        this.totalClients = totalClients;
        this.activeClients = activeClients;
        this.inactiveClients = inactiveClients;
        this.totalProjects = totalProjects;
    }

    public int getTotalClients() {
        return totalClients;
    }

    public int getActiveClients() {
        return activeClients;
    }

    public int getInactiveClients() {
        return inactiveClients;
    }

    public int getTotalProjects() {
        return totalProjects;
    }
}

