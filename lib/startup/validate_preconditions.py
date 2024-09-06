import os
import logging

logger = logging.getLogger(__name__)

def validate_preconditions():
    check_environment_variables()
    check_required_files()

def check_environment_variables():
    required_vars = ['DATABASE_URL', 'SECRET_KEY', 'DEBUG']
    missing_vars = [var for var in required_vars if var not in os.environ]
    if missing_vars:
        logger.error(f"Missing environment variables: {', '.join(missing_vars)}")
        raise EnvironmentError(f"Missing environment variables: {', '.join(missing_vars)}")
    else:
        logger.info("All required environment variables are set.")

def check_required_files():
    required_files = ['config.json', 'requirements.txt']
    missing_files = [file for file in required_files if not os.path.isfile(file)]
    if missing_files:
        logger.error(f"Missing required files: {', '.join(missing_files)}")
        raise FileNotFoundError(f"Missing required files: {', '.join(missing_files)}")
    else:
        logger.info("All required files are present.")

if __name__ == "__main__":
    validate_preconditions()
