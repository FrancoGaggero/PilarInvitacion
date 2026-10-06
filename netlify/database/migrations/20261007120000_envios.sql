-- Registro de envíos: cuándo se mandó la invitación y el último recordatorio
ALTER TABLE invitaciones ADD COLUMN enviada TIMESTAMPTZ;
ALTER TABLE invitaciones ADD COLUMN recordatorio TIMESTAMPTZ;
