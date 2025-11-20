package com.sentechcare.one.client.dto;

import com.sentechcare.one.common.enums.ClientType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRequestDto {

    @NotNull(message = "clientType is required")
    private ClientType clientType;

    @Size(max = 180, message = "companyName must not exceed 180 characters")
    private String companyName;

    @Size(max = 100, message = "firstName must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "lastName must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "phone is required")
    @Size(max = 30, message = "phone must not exceed 30 characters")
    private String phone;

    @Email(message = "email format is invalid")
    @Size(max = 255, message = "email must not exceed 255 characters")
    private String email;

    @Size(max = 255, message = "address must not exceed 255 characters")
    private String address;

    @Size(max = 120, message = "city must not exceed 120 characters")
    private String city;

    @Size(max = 120, message = "country must not exceed 120 characters")
    private String country;

    @Size(max = 150, message = "contactPerson must not exceed 150 characters")
    private String contactPerson;

    private String notes;

    private Boolean active;
}
