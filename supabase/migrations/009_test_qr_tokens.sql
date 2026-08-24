-- QR de prueba fijos para poder probar el flujo de escaneo sin depender
-- del panel admin (que se construye recién en la Fase 10).
delete from public.qr_tokens where status = 'AVAILABLE';

insert into public.qr_tokens (business_id, campaign_id, token, status, expires_at) values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTQR001A', 'AVAILABLE', now() + interval '30 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTQR002B', 'AVAILABLE', now() + interval '30 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTQR003C', 'AVAILABLE', now() + interval '30 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTQR004D', 'AVAILABLE', now() + interval '30 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTQR005E', 'AVAILABLE', now() + interval '30 days');
