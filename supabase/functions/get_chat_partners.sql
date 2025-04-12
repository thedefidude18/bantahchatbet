CREATE OR REPLACE FUNCTION get_chat_partners(p_user_id UUID)
RETURNS TABLE (user_id UUID) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
      CASE
        WHEN pm.sender_id = p_user_id THEN pm.receiver_id
        ELSE pm.sender_id
      END AS user_id
    FROM private_messages pm
    WHERE pm.sender_id = p_user_id OR pm.receiver_id = p_user_id
    AND (pm.sender_id != p_user_id OR pm.receiver_id != p_user_id);
END;
$$;
END;
$$;