DROP POLICY IF EXISTS communication_channels_select ON public.communication_channels;
CREATE POLICY communication_channels_select ON public.communication_channels
FOR SELECT TO authenticated
USING (public.can_access_communication_channel(id));

DROP TRIGGER IF EXISTS follow_up_assignment_notification ON public.follow_ups;
DROP TRIGGER IF EXISTS follow_ups_notify_assignment ON public.follow_ups;
CREATE TRIGGER follow_up_assignment_notification
AFTER INSERT OR UPDATE ON public.follow_ups
FOR EACH ROW EXECUTE FUNCTION public.notify_follow_up_assignment();

CREATE OR REPLACE FUNCTION public.notify_communication_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  channel_record public.communication_channels%ROWTYPE;
  recipient record;
BEGIN
  SELECT * INTO channel_record FROM public.communication_channels WHERE id = NEW.channel_id;
  IF channel_record.id IS NULL THEN RETURN NEW; END IF;
  FOR recipient IN
    SELECT DISTINCT cm.user_id
    FROM public.communication_channel_members cm
    WHERE cm.channel_id = NEW.channel_id
      AND cm.user_id IS NOT NULL
      AND cm.user_id <> NEW.sender_id
  LOOP
    PERFORM public.create_reachwell_notification(
      recipient.user_id,
      channel_record.organization_id,
      'communication_message',
      'New message in ' || COALESCE(channel_record.name, 'conversation'),
      LEFT(COALESCE(NEW.body, ''), 180),
      jsonb_build_object('channel_id', NEW.channel_id, 'message_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$function$;
