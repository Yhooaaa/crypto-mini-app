import aiosqlite
from datetime import datetime
from config import DB_PATH

_BALANCE_COLS = [
    ('usdt_balance', 'REAL NOT NULL DEFAULT 10000.0'),
    ('btc_balance',  'REAL NOT NULL DEFAULT 0.0'),
    ('eth_balance',  'REAL NOT NULL DEFAULT 0.0'),
    ('bnb_balance',  'REAL NOT NULL DEFAULT 0.0'),
    ('xrp_balance',  'REAL NOT NULL DEFAULT 0.0'),
    ('sol_balance',  'REAL NOT NULL DEFAULT 0.0'),
    ('ton_balance',  'REAL NOT NULL DEFAULT 0.0'),
]


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id       INTEGER PRIMARY KEY,
                language      TEXT    NOT NULL DEFAULT 'en',
                register_date TEXT    NOT NULL,
                usdt_balance  REAL    NOT NULL DEFAULT 10000.0,
                btc_balance   REAL    NOT NULL DEFAULT 0.0,
                eth_balance   REAL    NOT NULL DEFAULT 0.0,
                bnb_balance   REAL    NOT NULL DEFAULT 0.0,
                xrp_balance   REAL    NOT NULL DEFAULT 0.0,
                sol_balance   REAL    NOT NULL DEFAULT 0.0,
                ton_balance   REAL    NOT NULL DEFAULT 0.0
            )
        """)
        # Migrate existing DBs that don't have balance columns yet
        for col, definition in _BALANCE_COLS:
            try:
                await db.execute(f'ALTER TABLE users ADD COLUMN {col} {definition}')
            except Exception:
                pass
        await db.commit()


async def get_user(user_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM users WHERE user_id = ?', (user_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def create_user(user_id: int, language: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            'INSERT OR IGNORE INTO users (user_id, language, register_date) VALUES (?, ?, ?)',
            (user_id, language, datetime.now().strftime('%Y-%m-%d %H:%M')),
        )
        await db.commit()


async def update_language(user_id: int, language: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            'UPDATE users SET language = ? WHERE user_id = ?',
            (language, user_id),
        )
        await db.commit()


async def update_balances(user_id: int, **kwargs: float) -> None:
    if not kwargs:
        return
    cols = ', '.join(f'{k} = ?' for k in kwargs)
    vals = [*kwargs.values(), user_id]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f'UPDATE users SET {cols} WHERE user_id = ?', vals)
        await db.commit()
