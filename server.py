import asyncio
import logging
import os
import signal
import sys
from aiohttp import web
from lib.startup.validate_dependencies import validate_dependencies
from lib.startup.cleanup_ftp_folder import cleanup_ftp_folder
from lib.startup.customize_application import customize_application
from lib.startup.register_websocket_events import register_websocket_events
from lib.startup.restore_overwritten_files_with_originals import restore_overwritten_files_with_originals
from lib.startup.validate_chatbot import validate_chatbot
from lib.startup.validate_config import validate_config
from lib.startup.validate_preconditions import validate_preconditions

logger = logging.getLogger(__name__)

async def start_server():
    app = web.Application()
    app.router.add_get('/', handle)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8080)
    await site.start()
    logger.info("Server started at http://localhost:8080")
    return runner

async def handle(request):
    return web.Response(text="Hello, world")

async def main():
    await validate_dependencies()
    await cleanup_ftp_folder()
    await customize_application()
    await register_websocket_events()
    await restore_overwritten_files_with_originals()
    await validate_chatbot()
    await validate_config()
    await validate_preconditions()
    runner = await start_server()

    def shutdown(signal, frame):
        logger.info("Shutting down server...")
        asyncio.run(runner.cleanup())
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

if __name__ == "__main__":
    asyncio.run(main())
