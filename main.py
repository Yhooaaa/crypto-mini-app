import asyncio
import logging
import sys

from aiohttp import web as aio_web
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import BOT_TOKEN, API_PORT
from database import init_db
from handlers import router
from api import make_api_app


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)-8s | %(name)s: %(message)s',
        stream=sys.stdout,
    )

    if not BOT_TOKEN:
        raise ValueError('BOT_TOKEN is not set. Add it to the .env file or environment.')

    await init_db()

    # Start REST API server (aiohttp, runs in the same event loop as aiogram)
    api_runner = aio_web.AppRunner(make_api_app())
    await api_runner.setup()
    await aio_web.TCPSite(api_runner, '0.0.0.0', API_PORT).start()
    logging.info('API server started on port %s.', API_PORT)

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(router)

    logging.info('Bot started.')
    try:
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await api_runner.cleanup()
        await bot.session.close()


if __name__ == '__main__':
    asyncio.run(main())
