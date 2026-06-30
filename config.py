import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.environ["BOT_TOKEN"]
WEBAPP_URL: str = os.getenv("WEBAPP_URL", "https://example.com")
DB_PATH: str    = os.getenv("DB_PATH", "fittex.db")
API_PORT: int   = int(os.getenv("API_PORT", "8080"))

TRANSLATIONS: dict[str, dict[str, str]] = {
    "en": {
        "choose_language":  "🌐 Please choose your language:",
        "language_set":     "✅ Language set to English!",
        "main_menu":        "📋 Main Menu",
        "open_app":         "📱 Open Crypto App",
        "profile":          "👤 Profile",
        "change_language":  "🌐 Change Language",
        "profile_info":     (
            "👤 <b>Your Profile</b>\n"
            "🆔 ID: <code>{user_id}</code>\n"
            "🌐 Language: {language}\n"
            "📅 Registered: {register_date}"
        ),
        "language_changed": "✅ Language updated!",
    },
    "ru": {
        "choose_language":  "🌐 Пожалуйста, выберите язык:",
        "language_set":     "✅ Язык установлен: Русский!",
        "main_menu":        "📋 Главное меню",
        "open_app":         "📱 Открыть Crypto App",
        "profile":          "👤 Профиль",
        "change_language":  "🌐 Смена языка",
        "profile_info":     (
            "👤 <b>Ваш профиль</b>\n"
            "🆔 ID: <code>{user_id}</code>\n"
            "🌐 Язык: {language}\n"
            "📅 Дата регистрации: {register_date}"
        ),
        "language_changed": "✅ Язык обновлён!",
    },
    "ua": {
        "choose_language":  "🌐 Будь ласка, оберіть мову:",
        "language_set":     "✅ Мову встановлено: Українська!",
        "main_menu":        "📋 Головне меню",
        "open_app":         "📱 Відкрити Crypto App",
        "profile":          "👤 Профіль",
        "change_language":  "🌐 Зміна мови",
        "profile_info":     (
            "👤 <b>Ваш профіль</b>\n"
            "🆔 ID: <code>{user_id}</code>\n"
            "🌐 Мова: {language}\n"
            "📅 Дата реєстрації: {register_date}"
        ),
        "language_changed": "✅ Мову оновлено!",
    },
    "es": {
        "choose_language":  "🌐 Por favor, elige tu idioma:",
        "language_set":     "✅ ¡Idioma establecido: Español!",
        "main_menu":        "📋 Menú Principal",
        "open_app":         "📱 Abrir Crypto App",
        "profile":          "👤 Perfil",
        "change_language":  "🌐 Cambiar Idioma",
        "profile_info":     (
            "👤 <b>Tu perfil</b>\n"
            "🆔 ID: <code>{user_id}</code>\n"
            "🌐 Idioma: {language}\n"
            "📅 Registrado: {register_date}"
        ),
        "language_changed": "✅ ¡Idioma actualizado!",
    },
    "fr": {
        "choose_language":  "🌐 Veuillez choisir votre langue :",
        "language_set":     "✅ Langue définie : Français !",
        "main_menu":        "📋 Menu Principal",
        "open_app":         "📱 Ouvrir Crypto App",
        "profile":          "👤 Profil",
        "change_language":  "🌐 Changer de Langue",
        "profile_info":     (
            "👤 <b>Votre profil</b>\n"
            "🆔 ID : <code>{user_id}</code>\n"
            "🌐 Langue : {language}\n"
            "📅 Inscrit le : {register_date}"
        ),
        "language_changed": "✅ Langue mise à jour !",
    },
}

LANGUAGE_NAMES: dict[str, str] = {
    "en": "🇬🇧 English",
    "ru": "🇷🇺 Русский",
    "ua": "🇺🇦 Українська",
    "es": "🇪🇸 Español",
    "fr": "🇫🇷 Français",
}
