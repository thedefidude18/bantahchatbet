-- Replace transaction_id with the actual ID
SELECT 
    t.*,
    w.balance as wallet_balance,
    n.content as notification_content
FROM transactions t
LEFT JOIN wallets w ON w.id = t.wallet_id
LEFT JOIN notifications n ON n.metadata->>'transaction_id' = t.id::text
WHERE t.id = 'transaction_id'
OR t.reference = 'transaction_reference';
