package com.sentechcare.one.client.entity;

import com.sentechcare.one.common.entity.BaseAuditEntity;
import com.sentechcare.one.common.enums.ClientType;
import com.sentechcare.one.equipment.entity.Equipment;
import com.sentechcare.one.intervention.entity.Intervention;
import com.sentechcare.one.invoice.entity.Invoice;
import com.sentechcare.one.payment.entity.Payment;
import com.sentechcare.one.quote.entity.Quote;
import com.sentechcare.one.subscription.entity.Subscription;
import com.sentechcare.one.ticket.entity.Ticket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(
    name = "clients",
    indexes = {
        @Index(name = "idx_clients_company_name", columnList = "company_name"),
        @Index(name = "idx_clients_last_name_first_name", columnList = "last_name, first_name"),
        @Index(name = "idx_clients_phone", columnList = "phone"),
        @Index(name = "idx_clients_email", columnList = "email"),
        @Index(name = "idx_clients_client_type", columnList = "client_type"),
        @Index(name = "idx_clients_active", columnList = "active")
    }
)
public class Client extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "client_type", nullable = false, length = 20)
    private ClientType clientType;

    @Column(name = "company_name", length = 180)
    private String companyName;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = Boolean.TRUE;

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Subscription> subscriptions = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Equipment> equipments = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Intervention> interventions = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Ticket> tickets = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Quote> quotes = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Invoice> invoices = new LinkedHashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "client")
    private Set<Payment> payments = new LinkedHashSet<>();

    @PrePersist
    void initDefaults() {
        if (active == null) {
            active = Boolean.TRUE;
        }
    }
}
