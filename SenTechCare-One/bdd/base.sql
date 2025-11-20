CREATE DATABASE IF NOT EXISTS sentechcare_one
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE sentechcare_one;

SET time_zone = '+00:00';

CREATE TABLE roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Store hash only (bcrypt/argon2)',
  phone VARCHAR(30) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id)
    REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE clients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_type VARCHAR(20) NOT NULL,
  company_name VARCHAR(180) NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  contact_person VARCHAR(150) NULL,
  notes TEXT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT chk_clients_client_type CHECK (client_type IN ('HOUSE','SHOP','SCHOOL','SME','INSTITUTION')),
  CONSTRAINT chk_clients_identity CHECK (
    (company_name IS NOT NULL AND CHAR_LENGTH(TRIM(company_name)) > 0)
    OR
    (first_name IS NOT NULL AND CHAR_LENGTH(TRIM(first_name)) > 0 AND last_name IS NOT NULL AND CHAR_LENGTH(TRIM(last_name)) > 0)
  )
) ENGINE=InnoDB;

CREATE TABLE subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  plan_type VARCHAR(20) NOT NULL,
  monthly_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  billing_frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  description VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_subscriptions_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_subscriptions_plan_type CHECK (plan_type IN ('BASIC','BUSINESS','PREMIUM')),
  CONSTRAINT chk_subscriptions_frequency CHECK (billing_frequency IN ('MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL')),
  CONSTRAINT chk_subscriptions_status CHECK (status IN ('ACTIVE','SUSPENDED','EXPIRED','CANCELLED')),
  CONSTRAINT chk_subscriptions_monthly_price CHECK (monthly_price >= 0),
  CONSTRAINT chk_subscriptions_dates CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE installed_equipments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  category VARCHAR(30) NOT NULL,
  brand VARCHAR(100) NULL,
  model VARCHAR(120) NULL,
  serial_number VARCHAR(120) NULL,
  installation_date DATE NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  source VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
  warranty_start_date DATE NULL,
  warranty_end_date DATE NULL,
  location_details VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_installed_equipments_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_installed_equipments_category CHECK (category IN ('PC','LAPTOP','PRINTER','ROUTER','SWITCH','CAMERA','TV','SERVER','OTHER')),
  CONSTRAINT chk_installed_equipments_status CHECK (status IN ('ACTIVE','BROKEN','REPLACED','OUT_OF_SERVICE')),
  CONSTRAINT chk_installed_equipments_source CHECK (source IN ('SENTECHCARE','CLIENT')),
  CONSTRAINT chk_installed_equipments_warranty_dates CHECK (
    warranty_end_date IS NULL OR warranty_start_date IS NULL OR warranty_end_date >= warranty_start_date
  )
) ENGINE=InnoDB;

CREATE TABLE interventions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  assigned_technician_id BIGINT UNSIGNED NULL,
  type VARCHAR(30) NOT NULL,
  planned_date DATETIME(3) NULL,
  actual_date DATETIME(3) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  problem_description TEXT NOT NULL,
  diagnosis TEXT NULL,
  solution_provided TEXT NULL,
  duration_minutes INT UNSIGNED NULL,
  cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  closing_notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_interventions_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_interventions_technician FOREIGN KEY (assigned_technician_id)
    REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_interventions_type CHECK (type IN ('INSTALLATION','TROUBLESHOOTING','MAINTENANCE','UPDATE','VISIT','OTHER')),
  CONSTRAINT chk_interventions_status CHECK (status IN ('PENDING','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
  CONSTRAINT chk_interventions_priority CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  CONSTRAINT chk_interventions_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  CONSTRAINT chk_interventions_cost CHECK (cost >= 0),
  CONSTRAINT chk_interventions_dates CHECK (actual_date IS NULL OR planned_date IS NULL OR actual_date >= planned_date)
) ENGINE=InnoDB;

CREATE TABLE tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  assigned_technician_id BIGINT UNSIGNED NULL,
  channel VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  resolved_at DATETIME(3) NULL,
  resolution_comment TEXT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_tickets_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_technician FOREIGN KEY (assigned_technician_id)
    REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_tickets_channel CHECK (channel IN ('PHONE','WHATSAPP','EMAIL','VISIT')),
  CONSTRAINT chk_tickets_priority CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  CONSTRAINT chk_tickets_status CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
  CONSTRAINT chk_tickets_dates CHECK (resolved_at IS NULL OR resolved_at >= created_at)
) ENGINE=InnoDB;

CREATE TABLE quotes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference VARCHAR(50) NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  quote_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT uq_quotes_reference UNIQUE (reference),
  CONSTRAINT fk_quotes_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_quotes_status CHECK (status IN ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  CONSTRAINT chk_quotes_amounts CHECK (subtotal >= 0 AND discount_amount >= 0 AND total_amount >= 0 AND discount_amount <= subtotal),
  CONSTRAINT chk_quotes_total CHECK (total_amount = ROUND(subtotal - discount_amount, 2))
) ENGINE=InnoDB;

CREATE TABLE quote_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quote_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id)
    REFERENCES quotes (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_quote_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_quote_items_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_quote_items_total CHECK (line_total = ROUND(quantity * unit_price, 2))
) ENGINE=InnoDB;

CREATE TABLE invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference VARCHAR(50) NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  payment_method_note VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT uq_invoices_reference UNIQUE (reference),
  CONSTRAINT uq_invoices_id_client UNIQUE (id, client_id),
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_invoices_status CHECK (status IN ('DRAFT','ISSUED','PAID','PARTIALLY_PAID','UNPAID','CANCELLED')),
  CONSTRAINT chk_invoices_dates CHECK (due_date >= issue_date),
  CONSTRAINT chk_invoices_amounts CHECK (
    total_amount >= 0
    AND paid_amount >= 0
    AND remaining_amount >= 0
    AND paid_amount <= total_amount
    AND remaining_amount = ROUND(total_amount - paid_amount, 2)
  )
) ENGINE=InnoDB;

CREATE TABLE invoice_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id)
    REFERENCES invoices (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_invoice_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_invoice_items_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_invoice_items_total CHECK (line_total = ROUND(quantity * unit_price, 2))
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method VARCHAR(20) NOT NULL,
  payment_reference VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_payments_invoice_client FOREIGN KEY (invoice_id, client_id)
    REFERENCES invoices (id, client_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_payments_amount CHECK (amount > 0),
  CONSTRAINT chk_payments_method CHECK (method IN ('CASH','BANK_TRANSFER','MOBILE_MONEY','CHECK','OTHER'))
) ENGINE=InnoDB;

CREATE INDEX idx_users_role_id ON users (role_id);
CREATE INDEX idx_users_active ON users (active);

CREATE INDEX idx_clients_company_name ON clients (company_name);
CREATE INDEX idx_clients_last_name_first_name ON clients (last_name, first_name);
CREATE INDEX idx_clients_phone ON clients (phone);
CREATE INDEX idx_clients_email ON clients (email);
CREATE INDEX idx_clients_client_type ON clients (client_type);
CREATE INDEX idx_clients_active ON clients (active);

CREATE INDEX idx_subscriptions_client_id ON subscriptions (client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_start_date ON subscriptions (start_date);
CREATE INDEX idx_subscriptions_end_date ON subscriptions (end_date);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions (plan_type);

CREATE INDEX idx_installed_equipments_client_id ON installed_equipments (client_id);
CREATE INDEX idx_installed_equipments_status ON installed_equipments (status);
CREATE INDEX idx_installed_equipments_category ON installed_equipments (category);
CREATE INDEX idx_installed_equipments_serial_number ON installed_equipments (serial_number);

CREATE INDEX idx_interventions_client_id ON interventions (client_id);
CREATE INDEX idx_interventions_assigned_technician_id ON interventions (assigned_technician_id);
CREATE INDEX idx_interventions_status ON interventions (status);
CREATE INDEX idx_interventions_priority ON interventions (priority);
CREATE INDEX idx_interventions_planned_date ON interventions (planned_date);
CREATE INDEX idx_interventions_actual_date ON interventions (actual_date);
CREATE INDEX idx_interventions_created_at ON interventions (created_at);

CREATE INDEX idx_tickets_client_id ON tickets (client_id);
CREATE INDEX idx_tickets_assigned_technician_id ON tickets (assigned_technician_id);
CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority);
CREATE INDEX idx_tickets_channel ON tickets (channel);
CREATE INDEX idx_tickets_created_at ON tickets (created_at);
CREATE INDEX idx_tickets_resolved_at ON tickets (resolved_at);

CREATE INDEX idx_quotes_client_id ON quotes (client_id);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_quotes_quote_date ON quotes (quote_date);
CREATE INDEX idx_quotes_created_at ON quotes (created_at);

CREATE INDEX idx_quote_items_quote_id ON quote_items (quote_id);

CREATE INDEX idx_invoices_client_id ON invoices (client_id);
CREATE INDEX idx_invoices_status ON invoices (status);
CREATE INDEX idx_invoices_issue_date ON invoices (issue_date);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);
CREATE INDEX idx_invoices_created_at ON invoices (created_at);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items (invoice_id);

CREATE INDEX idx_payments_invoice_id ON payments (invoice_id);
CREATE INDEX idx_payments_client_id ON payments (client_id);
CREATE INDEX idx_payments_payment_date ON payments (payment_date);
CREATE INDEX idx_payments_method ON payments (method);
CREATE INDEX idx_payments_payment_reference ON payments (payment_reference);
CREATE INDEX idx_payments_created_at ON payments (created_at);

DELIMITER $$

CREATE PROCEDURE sp_sync_invoice_amounts(IN p_invoice_id BIGINT UNSIGNED)
BEGIN
  DECLARE v_total DECIMAL(15,2) DEFAULT 0.00;
  DECLARE v_paid DECIMAL(15,2) DEFAULT 0.00;
  DECLARE v_current_status VARCHAR(20);

  SELECT total_amount, status
    INTO v_total, v_current_status
  FROM invoices
  WHERE id = p_invoice_id;

  SELECT COALESCE(SUM(amount), 0.00)
    INTO v_paid
  FROM payments
  WHERE invoice_id = p_invoice_id;

  UPDATE invoices
  SET paid_amount = v_paid,
      remaining_amount = ROUND(v_total - v_paid, 2),
      status = CASE
        WHEN v_current_status = 'CANCELLED' THEN 'CANCELLED'
        WHEN v_current_status = 'DRAFT' AND v_paid = 0 THEN 'DRAFT'
        WHEN v_paid = 0 THEN 'UNPAID'
        WHEN v_paid > 0 AND v_paid < v_total THEN 'PARTIALLY_PAID'
        WHEN v_paid = v_total THEN 'PAID'
        ELSE v_current_status
      END
  WHERE id = p_invoice_id;
END$$

CREATE TRIGGER trg_payments_ai
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  CALL sp_sync_invoice_amounts(NEW.invoice_id);
END$$

CREATE TRIGGER trg_payments_au
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  IF OLD.invoice_id <> NEW.invoice_id THEN
    CALL sp_sync_invoice_amounts(OLD.invoice_id);
  END IF;
  CALL sp_sync_invoice_amounts(NEW.invoice_id);
END$$

CREATE TRIGGER trg_payments_ad
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
  CALL sp_sync_invoice_amounts(OLD.invoice_id);
END$$

DELIMITER ;

CREATE OR REPLACE VIEW vw_dashboard_monthly_revenue AS
SELECT
  DATE_FORMAT(payment_date, '%Y-%m-01') AS month_start,
  SUM(amount) AS total_collected,
  COUNT(*) AS payment_count
FROM payments
GROUP BY DATE_FORMAT(payment_date, '%Y-%m-01');

CREATE OR REPLACE VIEW vw_dashboard_subscription_status AS
SELECT
  status,
  COUNT(*) AS total
FROM subscriptions
GROUP BY status;

CREATE OR REPLACE VIEW vw_dashboard_ticket_backlog AS
SELECT
  status,
  priority,
  COUNT(*) AS total
FROM tickets
GROUP BY status, priority;

CREATE OR REPLACE VIEW vw_dashboard_intervention_backlog AS
SELECT
  status,
  priority,
  COUNT(*) AS total
FROM interventions
GROUP BY status, priority;

CREATE OR REPLACE VIEW vw_dashboard_invoice_summary AS
SELECT
  status,
  COUNT(*) AS total_invoices,
  SUM(total_amount) AS total_amount,
  SUM(paid_amount) AS paid_amount,
  SUM(remaining_amount) AS remaining_amount
FROM invoices
GROUP BY status;
