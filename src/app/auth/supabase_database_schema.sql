-- USERS
create table if not exists users (
  id text primary key,
  name text,
  password text,
  role text,
  introSeen integer default 0,
  paymentUseCount integer default 0
);

-- SETTINGS
create table if not exists settings (
  user_id text references users(id) on delete cascade,
  key text,
  value text,
  primary key (user_id, key)
);

-- PATIENT RECORDS
create table if not exists patient_records (
  user_id text references users(id) on delete cascade,
  condition text,
  risk numeric,
  date text,
  form_data jsonb
);

-- PAYMENT RECORDS
create table if not exists payment_records (
  id uuid primary key default gen_random_uuid(),
  amount numeric,
  date text,
  status text,
  method text,
  user_id text references users(id) on delete cascade
);

-- COMMENT RECORDS
create table if not exists comment_records (
  id uuid primary key default gen_random_uuid(),
  patient_id text references users(id) on delete cascade,
  doctor_id text references users(id) on delete cascade,
  comment text,
  note text,
  condition text,
  date text
);

-- Indexes for faster lookups
create index if not exists idx_patient_user on patient_records(user_id);
create index if not exists idx_payment_user on payment_records(user_id);
create index if not exists idx_comment_patient on comment_records(patient_id);
create index if not exists idx_comment_doctor on comment_records(doctor_id);
