-- Drop existing foreign key constraints if they exist
ALTER TABLE private_messages 
    DROP CONSTRAINT IF EXISTS private_messages_sender_id_fkey,
    DROP CONSTRAINT IF EXISTS private_messages_receiver_id_fkey;

-- Add correct foreign key constraints
ALTER TABLE private_messages
    ADD CONSTRAINT private_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT private_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) 
    REFERENCES users(id) ON DELETE CASCADE;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id = s.id
    LEFT JOIN users r ON pm.receiver_id = r.id
    LEFT JOIN private_messages rt ON pm.reply_to = rt.id
    LEFT JOIN users rts ON rt.sender_id = rts.id;

-- Create INSTEAD OF trigger
DROP TRIGGER IF EXISTS private_messages_with_users_insert ON private_messages_with_users;
CREATE TRIGGER private_messages_with_users_insert
    INSTEAD OF INSERT ON private_messages_with_users
    FOR EACH ROW
    EXECUTE FUNCTION insert_private_message_with_users();

-- Grant permissions
GRANT SELECT, INSERT ON private_messages_with_users TO authenticated;
GRANT ALL ON private_messages TO authenticated;

-- Create function for the INSTEAD OF trigger
CREATE OR REPLACE FUNCTION insert_private_message_with_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private_messages (
        content,
        sender_id,
        receiver_id,
        media_url,
        reply_to
    ) VALUES (
        NEW.content,
        NEW.sender_id,
        NEW.receiver_id,
        NEW.media_url,
        NEW.reply_to
    ) RETURNING * INTO NEW;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the view
CREATE OR REPLACE VIEW private_messages_with_users AS
SELECT 
    pm.*,
    s.name AS sender_name,
    s.avatar_url AS sender_avatar_url,
    s.username AS sender_username,
    r.name AS receiver_name,
    r.avatar_url AS receiver_avatar_url,
    r.username AS receiver_username,
    rt.content AS replied_to_content,
    rts.name AS replied_to_sender_name
FROM 
    private_messages pm
    LEFT JOIN users s ON pm.sender_id =
