import asyncio
from lib.startup.validate_dependencies_basic import validate_dependencies_basic
from server import start_server

async def main():
    await validate_dependencies_basic()
    await start_server()

if __name__ == "__main__":
    asyncio.run(main())
