import importlib.util
import logging

logger = logging.getLogger(__name__)

def validate_dependencies_basic():
    dependencies = [
        'aiohttp',
        'pandas',
        'requests',
        'sqlalchemy',
        'asyncio',
        'glob',
        'config',
        'colors',
        'sanitize',
        'html',
        'fs',
        'path',
        'json',
        'datetime',
        're'
    ]

    missing_dependencies = []

    for dependency in dependencies:
        if not importlib.util.find_spec(dependency):
            missing_dependencies.append(dependency)

    if missing_dependencies:
        logger.error(f"Missing dependencies: {', '.join(missing_dependencies)}")
        raise ImportError(f"Missing dependencies: {', '.join(missing_dependencies)}")
    else:
        logger.info("All dependencies are installed.")

if __name__ == "__main__":
    validate_dependencies_basic()
