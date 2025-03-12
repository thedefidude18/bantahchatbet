create table public.paystack_recipients (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    recipient_code text not null,
    account_number text not null,
    bank_code text not null,
    account_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.paystack_recipients enable row level security;

create policy "Users can view their own recipients"
    on public.paystack_recipients for select
    using (auth.uid() = user_id);

create policy "Users can create their own recipients"
    on public.paystack_recipients for insert
    with check (auth.uid() = user_id);