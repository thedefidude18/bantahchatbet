CREATE OR REPLACE FUNCTION get_users(user_id UUID, search_term TEXT)
RETURNS TABLE (id UUID, name TEXT, username TEXT) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.username
  FROM
    users u
  WHERE
    (
      u.username ILIKE '%' || search_term || '%'
      OR u.name ILIKE '%' || search_term || '%'
    )
    AND u.id <> user_id
  ORDER BY u.username;
END;
$$