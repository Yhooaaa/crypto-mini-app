from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    CallbackQuery,
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)

from config import TRANSLATIONS, LANGUAGE_NAMES, WEBAPP_URL
from database import get_user, create_user, update_language

router = Router()

# All possible button labels across every language (computed once at import time)
_ALL_PROFILE_TEXTS: frozenset[str] = frozenset(
    v["profile"] for v in TRANSLATIONS.values()
)
_ALL_CHANGE_LANG_TEXTS: frozenset[str] = frozenset(
    v["change_language"] for v in TRANSLATIONS.values()
)


def t(lang: str, key: str, **kwargs: str) -> str:
    text = TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(key, key)
    return text.format(**kwargs) if kwargs else text


def language_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=label, callback_data=f"lang:{code}")]
            for code, label in LANGUAGE_NAMES.items()
        ]
    )


def main_menu_keyboard(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text=t(lang, "open_app"),
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ],
            [
                KeyboardButton(text=t(lang, "profile")),
                KeyboardButton(text=t(lang, "change_language")),
            ],
        ],
        resize_keyboard=True,
    )


# ── /start ────────────────────────────────────────────────────────────────────

@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if user is None:
        await message.answer(
            TRANSLATIONS["en"]["choose_language"],
            reply_markup=language_keyboard(),
        )
    else:
        await message.answer(
            t(user["language"], "main_menu"),
            reply_markup=main_menu_keyboard(user["language"]),
        )


# ── Language selection (inline callback) ──────────────────────────────────────

@router.callback_query(F.data.startswith("lang:"))
async def cb_select_language(callback: CallbackQuery) -> None:
    lang = callback.data.split(":", 1)[1]
    if lang not in TRANSLATIONS:
        await callback.answer()
        return

    user = await get_user(callback.from_user.id)
    if user is None:
        await create_user(callback.from_user.id, lang)
    else:
        await update_language(callback.from_user.id, lang)

    await callback.message.edit_text(t(lang, "language_set"))
    await callback.message.answer(
        t(lang, "main_menu"),
        reply_markup=main_menu_keyboard(lang),
    )
    await callback.answer()


# ── Profile ───────────────────────────────────────────────────────────────────

@router.message(F.text.in_(_ALL_PROFILE_TEXTS))
async def show_profile(message: Message) -> None:
    user = await get_user(message.from_user.id)
    if not user:
        return
    lang = user["language"]
    await message.answer(
        t(
            lang,
            "profile_info",
            user_id=str(user["user_id"]),
            language=LANGUAGE_NAMES.get(lang, lang),
            register_date=user["register_date"],
        )
    )


# ── Change language ───────────────────────────────────────────────────────────

@router.message(F.text.in_(_ALL_CHANGE_LANG_TEXTS))
async def change_language(message: Message) -> None:
    user = await get_user(message.from_user.id)
    lang = user["language"] if user else "en"
    await message.answer(
        t(lang, "choose_language"),
        reply_markup=language_keyboard(),
    )
