# Codebase and Database Schema Analysis

This report outlines the current database schema, designs database migration scripts for adding presence (`last_seen`) and message read status (`read_at`), evaluates Row-Level Security (RLS) policies, identifies the initialization points in the React codebase, and provides recommendations for implementation.

---

## 1. Current Database Schema Analysis

Based on `docs/db_schema.sql`, the key tables are:

### `profiles` Table
- **Location**: `docs/db_schema.sql` (Lines 4-19)
- **Structure**:
  ```sql
  create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    name text not null,
    university text,
    faculty text,
    department text,
    level text,
    chess_username text,
    lichess_username text,
    chess_rating integer default 0,
    lichess_rating integer default 0,
    last_rating_sync timestamp with time zone,
    role text default 'player',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```

### `direct_messages` Table
- **Location**: `docs/db_schema.sql` (Lines 49-55)
- **Structure**:
  ```sql
  create table if not exists public.direct_messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```

---

## 2. Live Database Schema Verification

Since terminal command execution timed out (due to permission prompt limits), we can check and verify the live database schema using the following methods:

### Method A: SQL Query Verification
Run the following query in the Supabase SQL Editor or a postgres database client to inspect the schema columns:

```sql
-- Check columns of profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('last_seen', 'last_rating_sync', 'role');

-- Check columns of direct_messages table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'direct_messages' 
  AND column_name IN ('read_at', 'sender_id', 'receiver_id');
```

If the fields `last_seen` or `read_at` are returned, they are already present on the live schema. If not, they need to be migrated.

### Method B: Supabase Dashboard
1. Open the Supabase dashboard.
2. Select your project.
3. Click on the **Table Editor** on the sidebar.
4. Select `profiles` and check if `last_seen` exists in the columns.
5. Select `direct_messages` and check if `read_at` exists in the columns.

---

## 3. Database Migration SQL Queries

To add the required tracking columns, run the following SQL statements in the database:

```sql
-- Migration: Add presence and message read status tracking columns

-- 1. Add 'last_seen' to public.profiles table
ALTER TABLE public.profiles
ADD COLUMN last_seen timestamp with time zone;

-- 2. Add 'read_at' to public.direct_messages table
ALTER TABLE public.direct_messages
ADD COLUMN read_at timestamp with time zone;

-- 3. (Optional but Recommended) Create indices for query optimization
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen 
ON public.profiles(last_seen);

CREATE INDEX IF NOT EXISTS idx_direct_messages_read_at 
ON public.direct_messages(read_at) 
WHERE read_at IS NULL;
```

---

## 4. RLS (Row Level Security) Policies Evaluation

### Profiles Table Policies
- **Current Policies** in `docs/db_schema.sql` (Lines 25-29):
  ```sql
  create policy "Public profiles are viewable by everyone" on public.profiles
    for select using (true);

  create policy "Users can update their own profiles" on public.profiles
    for update using (auth.uid() = id);
  ```
- **Security Impact of `last_seen`**:
  - The `select` policy allows all users to read `last_seen` of any user. This is necessary to show online status or "last seen X mins ago" badges in the UI.
  - The `update` policy allows users to update their own profile records. This enables the client to periodically update the user's own `last_seen` timestamp.
  - **Conclusion**: **No new RLS policies** are required for the `profiles` table. The current policies are sufficient and secure.

### Direct Messages Table Policies
- **Current Policies** in `docs/db_schema.sql` (Lines 59-63):
  ```sql
  create policy "Users can view messages sent to or by them" on public.direct_messages
    for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

  create policy "Users can send messages as themselves" on public.direct_messages
    for insert with check (auth.uid() = sender_id);
  ```
- **Security Impact of `read_at`**:
  - Since direct messages can now be updated (the receiver needs to mark the message as read by setting `read_at`), we **MUST** define an `UPDATE` policy.
  - Currently, there is NO policy allowing updates on `direct_messages`. Any `update` attempt will fail by default.
  - Only the message receiver (`receiver_id`) should be allowed to mark a message as read. The sender should NOT be able to modify the read status of a message they sent.
- **Proposed RLS Update Policy**:
  ```sql
  CREATE POLICY "Users can update direct messages received by them" ON public.direct_messages
    FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);
  ```

---

## 5. Codebase Initialization Points (React Application)

### A. Direct Messages Initialization
The fetching and real-time subscription of direct messages is initialized in:
- **File**: `src/components/messaging/DirectChat.jsx`
- **Location**: Inside the second `useEffect` hook (Lines 58–111) triggered when `activeContact` or `user` changes.

#### Current Code Snippet:
```javascript
  // 2. Fetch and Subscribe to messages when activeContact changes
  useEffect(() => {
    if (!user || !activeContact) return;
    setLoadingChats(true);

    const fetchDirectMessages = async () => {
      // ... fetches messages where user.id is sender or receiver
    };

    fetchDirectMessages();

    // Subscribe to realtime messages involving this contact
    const subscription = supabase
      .channel(`direct:${activeContact.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          // ... handles new messages insertion
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeContact, user]);
```

#### Proposed Changes for `read_at`:
To mark messages as read and reflect it in real-time, the following additions should be made:
1. **Mark fetched messages as read**:
   When fetching message history in `DirectChat.jsx`, the receiver should mark all unread messages from that contact as read:
   ```javascript
   const markMessagesAsRead = async () => {
     await supabase
       .from('direct_messages')
       .update({ read_at: new Date().toISOString() })
       .eq('sender_id', activeContact.id)
       .eq('receiver_id', user.id)
       .is('read_at', null);
   };
   ```
2. **Listen for UPDATE events in Realtime**:
   Change the subscription events to listen for updates so both clients can see when messages are read:
   ```javascript
   const subscription = supabase
     .channel(`direct:${activeContact.id}`)
     .on(
       'postgres_changes',
       { event: '*', schema: 'public', table: 'direct_messages' },
       (payload) => {
         if (payload.eventType === 'INSERT') {
           const newMsg = payload.new;
           // If we receive a message in real-time while in this chat, mark it as read immediately
           if (newMsg.sender_id === activeContact.id && newMsg.receiver_id === user.id) {
             supabase
               .from('direct_messages')
               .update({ read_at: new Date().toISOString() })
               .eq('id', newMsg.id);
           }
           // Add to messages state
         } else if (payload.eventType === 'UPDATE') {
           const updatedMsg = payload.new;
           // Update message in state to show read ticks
           setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
         }
       }
     )
     .subscribe();
   ```

### B. Presence Subscriptions Initialization
Currently, **there is NO presence tracking or presence subscription initialized** in the React application. 

#### Recommended Location:
Presence tracking must run globally across the entire app for any signed-in user. The correct place to initialize it is in:
- **File**: `src/hooks/useAuth.jsx`
- **Location**: Within the `AuthProvider` component, using a new `useEffect` triggered by `user` status changes.

#### Proposed Presence Implementation:
We recommend a dual-channel presence solution:
1. **Periodic DB Updates** (for persistent `last_seen` column updates):
   ```javascript
   useEffect(() => {
     if (!user) return;

     const updateLastSeen = async () => {
       await supabase
         .from('profiles')
         .update({ last_seen: new Date().toISOString() })
         .eq('id', user.id);
     };

     // Run immediately and then every 30 seconds
     updateLastSeen();
     const interval = setInterval(updateLastSeen, 30000);

     return () => clearInterval(interval);
   }, [user]);
   ```
2. **Supabase Realtime Presence** (for instant online/offline UI badges without hammering the DB):
   ```javascript
   const [onlineUsers, setOnlineUsers] = useState({});

   useEffect(() => {
     if (!user) return;

     const presenceChannel = supabase.channel('online-users');

     presenceChannel
       .on('presence', { event: 'sync' }, () => {
         setOnlineUsers(presenceChannel.presenceState());
       })
       .subscribe(async (status) => {
         if (status === 'SUBSCRIBED') {
           await presenceChannel.track({
             id: user.id,
             online_at: new Date().toISOString(),
           });
         }
       });

     return () => {
       supabase.removeChannel(presenceChannel);
     };
   }, [user]);
   ```
