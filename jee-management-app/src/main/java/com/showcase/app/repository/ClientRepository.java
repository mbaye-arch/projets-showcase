package com.showcase.app.repository;

import com.showcase.app.model.Client;
import com.showcase.app.model.DashboardStats;

import java.util.List;

public class ClientRepository {

    private final List<Client> clients = List.of(
            new Client(1, "North Digital", "Lille", "Software", "active", 4),
            new Client(2, "Atlas Services", "Paris", "Consulting", "active", 3),
            new Client(3, "Nova Retail", "Lyon", "Retail", "inactive", 1),
            new Client(4, "Data Harbor", "Nantes", "Data", "active", 5),
            new Client(5, "Cloud Works", "Grenoble", "Cloud", "active", 2)
    );

    public List<Client> findAll() {
        return clients;
    }

    public DashboardStats getStats() {
        int activeClients = (int) clients.stream().filter(Client::isActive).count();
        int totalProjects = clients.stream().mapToInt(Client::getActiveProjects).sum();

        return new DashboardStats(
                clients.size(),
                activeClients,
                clients.size() - activeClients,
                totalProjects
        );
    }
}

