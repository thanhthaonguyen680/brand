-- Bank transfer / PayPal details, editable from admin settings
alter table public.store_settings
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_account_holder text,
  add column if not exists paypal_account text;

-- Replace card/VNPay/MoMo with bank_transfer/paypal in the allowed payment methods
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('bank_transfer', 'paypal', 'cod'));
