import logging
import config
import colors
import utils

logger = logging.getLogger(__name__)

def validate_config(config_data, exit_on_failure=True):
    success = True
    success = check_required_field_exists(config_data, 'application.name') and success
    success = check_required_field_exists(config_data, 'application.logo') and success
    success = check_required_field_exists(config_data, 'application.favicon') and success
    success = check_required_field_exists(config_data, 'application.theme') and success
    success = check_required_field_exists(config_data, 'application.cookieConsent') and success
    success = check_required_field_exists(config_data, 'application.promotion') and success
    success = check_required_field_exists(config_data, 'hackingInstructor') and success
    success = check_required_field_exists(config_data, 'application.chatBot') and success
    if success:
        logger.info(f"Configuration data {colors.bold(utils.extract_filename(config.get('application.configFile')))} validated ({colors.green('OK')})")
    else:
        logger.warn(f"Configuration data {colors.bold(utils.extract_filename(config.get('application.configFile')))} validated ({colors.red('NOT OK')})")
        logger.warn(f"Visit {colors.yellow('https://pwning.owasp-juice.shop/appendix/configuration.html')} for the configuration data schema definition.")
        if exit_on_failure:
            logger.error(colors.red('Exiting due to configuration errors!'))
            exit(1)
    return success

def check_required_field_exists(config_data, field):
    success = True
    if field not in config_data:
        logger.warn(f"Required field {colors.italic(field)} is missing in configuration data ({colors.red('NOT OK')})")
        success = False
    return success
