-- ============================================================
-- 巡礼（Junrei）── 完全データベーススキーマ
-- Supabase SQL Editor で上から順に実行してください
-- ============================================================


-- ============================================================
-- 1. テーブル作成
-- ============================================================

-- ユーザープロフィール
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  display_name  text,
  temperament   text          check (temperament in ('mirror','number','abyss','story','breaker')),
  sub_temperament text        check (sub_temperament in ('mirror','number','abyss','story','breaker')),
  level         integer       default 1    not null check (level >= 1 and level <= 10),
  exp           integer       default 0    not null check (exp >= 0),
  title         text          default '旅立つ者' not null,
  onboarding_done boolean     default false not null,
  created_at    timestamptz   default now() not null,
  updated_at    timestamptz   default now() not null
);

comment on table  public.profiles is '巡礼者のプロフィール情報';
comment on column public.profiles.temperament is 'メイン気質: mirror/number/abyss/story/breaker';
comment on column public.profiles.sub_temperament is 'サブ気質';
comment on column public.profiles.title is '現在の称号';


-- 対話履歴
create table if not exists public.conversations (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references public.profiles(id) on delete cascade not null,
  encounter_id    text        not null,
  session_number  integer     default 1  not null check (session_number >= 1),
  messages        jsonb       default '[]'::jsonb not null,
  is_completed    boolean     default false not null,
  thought_depth   integer     default 0  not null check (thought_depth >= 0 and thought_depth <= 10),
  exp_earned      integer     default 0  not null check (exp_earned >= 0),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

comment on table  public.conversations is 'AIとの対話セッション履歴';
comment on column public.conversations.messages is '[{role, content, timestamp}] の配列';
comment on column public.conversations.thought_depth is 'AIが判定した思考深度 0〜10';


-- 邂逅（エンカウンター）進捗
create table if not exists public.encounter_progress (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references public.profiles(id) on delete cascade not null,
  encounter_id    text        not null,
  current_session integer     default 1 not null check (current_session >= 1),
  total_sessions  integer     not null  check (total_sessions >= 1),
  is_completed    boolean     default false not null,
  completed_at    timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  unique(user_id, encounter_id)
);

comment on table public.encounter_progress is '各邂逅（著者との出会い）の進捗管理';


-- 収集した名言
create table if not exists public.collected_quotes (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references public.profiles(id) on delete cascade not null,
  encounter_id  text        not null,
  quote         text        not null,
  author        text        not null,
  collected_at  timestamptz default now() not null
);

comment on table public.collected_quotes is '対話の中で収集した名言（お守り）';


-- ログインボーナス管理
create table if not exists public.login_streaks (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references public.profiles(id) on delete cascade not null unique,
  last_login_date date        not null default current_date,
  streak_count    integer     default 1 not null check (streak_count >= 0),
  total_logins    integer     default 1 not null check (total_logins >= 1),
  created_at      timestamptz default now() not null
);

comment on table public.login_streaks is '連続ログインとログインボーナスの管理';


-- ============================================================
-- 2. インデックス
-- ============================================================

create index if not exists idx_conversations_user_id
  on public.conversations(user_id);

create index if not exists idx_conversations_user_encounter
  on public.conversations(user_id, encounter_id);

create index if not exists idx_encounter_progress_user_id
  on public.encounter_progress(user_id);

create index if not exists idx_collected_quotes_user_id
  on public.collected_quotes(user_id);

create index if not exists idx_collected_quotes_user_encounter
  on public.collected_quotes(user_id, encounter_id);

create index if not exists idx_login_streaks_user_id
  on public.login_streaks(user_id);


-- ============================================================
-- 3. updated_at 自動更新トリガー
-- ============================================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create or replace trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();

create or replace trigger trg_encounter_progress_updated_at
  before update on public.encounter_progress
  for each row execute function public.update_updated_at();


-- ============================================================
-- 4. 新規ユーザー登録時にプロフィール自動作成
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', '巡礼者'));

  insert into public.login_streaks (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- 既存トリガーがあれば削除してから再作成
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 5. ログインボーナス処理関数
-- ============================================================

create or replace function public.claim_login_bonus(p_user_id uuid)
returns json as $$
declare
  v_streak    public.login_streaks%rowtype;
  v_bonus_exp integer := 20;  -- 基本ログインボーナス
  v_is_new    boolean := false;
begin
  select * into v_streak
  from public.login_streaks
  where user_id = p_user_id;

  -- レコードがない場合は作成
  if not found then
    insert into public.login_streaks (user_id)
    values (p_user_id);
    v_is_new := true;
  -- 今日既にログイン済み
  elsif v_streak.last_login_date = current_date then
    return json_build_object(
      'success', false,
      'message', '今日のログインボーナスは既に受け取っています',
      'streak', v_streak.streak_count,
      'exp_earned', 0
    );
  else
    -- 連続ログイン判定
    if v_streak.last_login_date = current_date - interval '1 day' then
      -- 連続！ストリーク加算
      update public.login_streaks
      set last_login_date = current_date,
          streak_count = streak_count + 1,
          total_logins = total_logins + 1
      where user_id = p_user_id;
    else
      -- 途切れた：リセット
      update public.login_streaks
      set last_login_date = current_date,
          streak_count = 1,
          total_logins = total_logins + 1
      where user_id = p_user_id;
    end if;
  end if;

  -- 連続ボーナス（7日ごとに+50）
  select streak_count into v_streak.streak_count
  from public.login_streaks
  where user_id = p_user_id;

  if v_streak.streak_count % 7 = 0 then
    v_bonus_exp := v_bonus_exp + 50;
  end if;

  -- EXPを付与
  update public.profiles
  set exp = exp + v_bonus_exp
  where id = p_user_id;

  -- レベルアップ判定
  perform public.check_level_up(p_user_id);

  return json_build_object(
    'success', true,
    'message', 'ログインボーナスを受け取りました',
    'streak', v_streak.streak_count,
    'exp_earned', v_bonus_exp
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 6. レベルアップ判定関数
-- ============================================================

create or replace function public.check_level_up(p_user_id uuid)
returns void as $$
declare
  v_exp   integer;
  v_level integer;
  v_new_level integer := 1;
  v_thresholds integer[] := array[0, 200, 500, 1000, 1800, 3000, 4500, 6500, 9000, 12000];
begin
  select exp, level into v_exp, v_level
  from public.profiles
  where id = p_user_id;

  -- 新レベルを計算
  for i in reverse 10..1 loop
    if v_exp >= v_thresholds[i] then
      v_new_level := i;
      exit;
    end if;
  end loop;

  -- レベルが変わった場合のみ更新
  if v_new_level != v_level then
    update public.profiles
    set level = v_new_level
    where id = p_user_id;
  end if;
end;
$$ language plpgsql security definer;


-- ============================================================
-- 7. EXP付与関数（対話完了時にアプリから呼ぶ）
-- ============================================================

create or replace function public.add_exp(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text default 'dialogue'
)
returns json as $$
declare
  v_profile public.profiles%rowtype;
begin
  -- EXP加算
  update public.profiles
  set exp = exp + p_amount
  where id = p_user_id
  returning * into v_profile;

  -- レベルアップ判定
  perform public.check_level_up(p_user_id);

  -- 更新後のプロフィールを取得
  select * into v_profile
  from public.profiles
  where id = p_user_id;

  return json_build_object(
    'success', true,
    'new_exp', v_profile.exp,
    'new_level', v_profile.level,
    'amount_added', p_amount,
    'reason', p_reason
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 8. 称号更新関数
-- ============================================================

create or replace function public.update_title(p_user_id uuid)
returns text as $$
declare
  v_title           text := '旅立つ者';
  v_conversation_count integer;
  v_tier0_completed integer;
  v_tier1_completed integer;
  v_tier2_completed integer;
begin
  -- 対話数をカウント
  select count(*) into v_conversation_count
  from public.conversations
  where user_id = p_user_id and is_completed = true;

  -- 各Tierの完了数をカウント
  select count(*) into v_tier0_completed
  from public.encounter_progress
  where user_id = p_user_id
    and is_completed = true
    and encounter_id in ('little-prince', 'adler', 'fermat');

  -- 称号を判定（上位から）
  if v_tier0_completed >= 3 then
    v_title := '問いを知った者';
  elsif v_conversation_count >= 1 then
    v_title := '旅立つ者';
  end if;

  -- 称号を更新
  update public.profiles
  set title = v_title
  where id = p_user_id;

  return v_title;
end;
$$ language plpgsql security definer;


-- ============================================================
-- 9. 邂逅進捗の更新/作成関数
-- ============================================================

create or replace function public.upsert_encounter_progress(
  p_user_id        uuid,
  p_encounter_id   text,
  p_total_sessions integer
)
returns json as $$
declare
  v_progress public.encounter_progress%rowtype;
begin
  -- 既存レコードを探す
  select * into v_progress
  from public.encounter_progress
  where user_id = p_user_id and encounter_id = p_encounter_id;

  if not found then
    -- 新規作成
    insert into public.encounter_progress (user_id, encounter_id, total_sessions)
    values (p_user_id, p_encounter_id, p_total_sessions)
    returning * into v_progress;
  else
    -- セッション進行
    if not v_progress.is_completed then
      if v_progress.current_session >= v_progress.total_sessions then
        -- 邂逅完了
        update public.encounter_progress
        set is_completed = true, completed_at = now()
        where id = v_progress.id
        returning * into v_progress;

        -- 称号更新
        perform public.update_title(p_user_id);
      else
        -- 次のセッションへ
        update public.encounter_progress
        set current_session = current_session + 1
        where id = v_progress.id
        returning * into v_progress;
      end if;
    end if;
  end if;

  return json_build_object(
    'encounter_id',    v_progress.encounter_id,
    'current_session', v_progress.current_session,
    'total_sessions',  v_progress.total_sessions,
    'is_completed',    v_progress.is_completed
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 10. 統計ビュー
-- ============================================================

-- ユーザーダッシュボード用ビュー
create or replace view public.user_stats as
select
  p.id as user_id,
  p.display_name,
  p.temperament,
  p.level,
  p.exp,
  p.title,
  (select count(*) from public.conversations c
   where c.user_id = p.id) as total_conversations,
  (select count(*) from public.conversations c
   where c.user_id = p.id and c.is_completed = true) as completed_conversations,
  (select coalesce(avg(c.thought_depth), 0) from public.conversations c
   where c.user_id = p.id and c.thought_depth > 0) as avg_thought_depth,
  (select count(*) from public.encounter_progress ep
   where ep.user_id = p.id and ep.is_completed = true) as encounters_completed,
  (select count(*) from public.collected_quotes cq
   where cq.user_id = p.id) as quotes_collected,
  (select streak_count from public.login_streaks ls
   where ls.user_id = p.id) as login_streak
from public.profiles p;

comment on view public.user_stats is 'ユーザーダッシュボード用の統計情報';


-- 教師ダッシュボード用ビュー（匿名化）
-- ※学校ライセンス用。将来的にグループ機能と組み合わせて使用
create or replace view public.anonymous_class_stats as
select
  p.temperament,
  p.level,
  (select coalesce(avg(c.thought_depth), 0) from public.conversations c
   where c.user_id = p.id and c.thought_depth > 0) as avg_thought_depth,
  (select count(*) from public.encounter_progress ep
   where ep.user_id = p.id and ep.is_completed = true) as encounters_completed,
  p.created_at::date as join_date
from public.profiles p
where p.onboarding_done = true;

comment on view public.anonymous_class_stats is '教師ダッシュボード用の匿名化された統計';


-- ============================================================
-- 11. RLS (Row Level Security) を有効化
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.conversations     enable row level security;
alter table public.encounter_progress enable row level security;
alter table public.collected_quotes  enable row level security;
alter table public.login_streaks     enable row level security;


-- ============================================================
-- 12. RLS ポリシー
-- ============================================================

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- conversations
create policy "conversations_select_own"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "conversations_update_own"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- encounter_progress
create policy "encounter_progress_select_own"
  on public.encounter_progress for select
  using (auth.uid() = user_id);

create policy "encounter_progress_insert_own"
  on public.encounter_progress for insert
  with check (auth.uid() = user_id);

create policy "encounter_progress_update_own"
  on public.encounter_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- collected_quotes
create policy "collected_quotes_select_own"
  on public.collected_quotes for select
  using (auth.uid() = user_id);

create policy "collected_quotes_insert_own"
  on public.collected_quotes for insert
  with check (auth.uid() = user_id);

-- login_streaks
create policy "login_streaks_select_own"
  on public.login_streaks for select
  using (auth.uid() = user_id);

create policy "login_streaks_update_own"
  on public.login_streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "login_streaks_insert_own"
  on public.login_streaks for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- 13. 初期データ（Tier 0 邂逅マスターデータ）
-- ============================================================

create table if not exists public.encounter_master (
  id              text primary key,
  tier            integer not null check (tier >= 0),
  title           text not null,
  author          text not null,
  book_title      text not null,
  core_theme      text not null,
  total_sessions  integer not null check (total_sessions >= 1),
  temperament_affinity text[] not null,
  description     text,
  is_active       boolean default true not null,
  sort_order      integer default 0 not null,
  created_at      timestamptz default now() not null
);

comment on table public.encounter_master is '邂逅（著者との出会い）のマスターデータ';

alter table public.encounter_master enable row level security;

-- 全ユーザーが閲覧可能
create policy "encounter_master_select_all"
  on public.encounter_master for select
  using (true);

-- Tier 0 初期データ
insert into public.encounter_master (id, tier, title, author, book_title, core_theme, total_sessions, temperament_affinity, description, sort_order)
values
  (
    'little-prince', 0,
    '星の王子さま',
    'サン＝テグジュペリ',
    'Le Petit Prince',
    '本当に大切なものは目に見えない',
    5,
    array['story', 'mirror', 'abyss'],
    '砂漠に不時着した飛行士と、小さな星からやってきた王子さまの物語。短く、比喩が豊かで、年齢を問わず深い問いが可能。',
    1
  ),
  (
    'adler', 0,
    '嫌われる勇気',
    'アドラー（岸見一郎・古賀史健）',
    'The Courage to Be Disliked',
    '他者の期待から自由になる',
    8,
    array['mirror', 'breaker'],
    'アドラー心理学を対話形式で学ぶ一冊。「嫌われることを恐れない」という考え方が、自分を縛る鎖を解き放つ。',
    2
  ),
  (
    'fermat', 0,
    'フェルマーの最終定理',
    'サイモン・シン',
    'Fermat''s Last Theorem',
    '知的執念の美しさ',
    8,
    array['number', 'abyss'],
    '360年間誰も解けなかった数学の問題に挑んだ人々の物語。知的好奇心と執念が生む美しさに触れる。',
    3
  )
on conflict (id) do nothing;

-- Tier 1 データ（将来用・ロック状態）
insert into public.encounter_master (id, tier, title, author, book_title, core_theme, total_sessions, temperament_affinity, description, is_active, sort_order)
values
  ('camus', 1, '異邦人', 'カミュ', 'L''Étranger', '不条理の中でどう生きるか', 8, array['abyss', 'breaker'], null, false, 10),
  ('murakami', 1, 'ノルウェイの森', '村上春樹', 'Norwegian Wood', '喪失と再生', 8, array['mirror', 'story'], null, false, 11),
  ('sandel', 1, 'これからの「正義」の話をしよう', 'マイケル・サンデル', 'Justice', '正義は一つではない', 8, array['breaker', 'number'], null, false, 12),
  ('sacks', 1, '妻を帽子とまちがえた男', 'オリヴァー・サックス', 'The Man Who Mistook His Wife for a Hat', '「正常」とは何か', 8, array['number', 'mirror'], null, false, 13)
on conflict (id) do nothing;

-- Tier 2 データ（将来用・ロック状態）
insert into public.encounter_master (id, tier, title, author, book_title, core_theme, total_sessions, temperament_affinity, description, is_active, sort_order)
values
  ('dostoevsky', 2, '罪と罰', 'ドストエフスキー', 'Crime and Punishment', '善悪の境界', 10, array['abyss', 'mirror'], null, false, 20),
  ('kafka', 2, '変身', 'カフカ', 'Die Verwandlung', '不条理な世界での自己', 8, array['abyss', 'story'], null, false, 21),
  ('nietzsche', 2, 'ツァラトゥストラはこう語った', 'ニーチェ', 'Also sprach Zarathustra', '既存の価値の破壊と創造', 10, array['breaker', 'abyss'], null, false, 22),
  ('arendt', 2, '人間の条件', 'ハンナ・アーレント', 'The Human Condition', '思考停止の恐ろしさ', 10, array['breaker', 'number'], null, false, 23)
on conflict (id) do nothing;


-- ============================================================
-- 完了
-- ============================================================
-- 上記を Supabase SQL Editor に貼り付けて実行してください。
-- テーブル5個 + マスターデータ1個 + RLSポリシー + 関数5個 + ビュー2個 が作成されます。
