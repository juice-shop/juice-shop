import logging
import config
import colors
import utils

logger = logging.getLogger(__name__)

def validate_chatbot(training_data, exit_on_failure=True):
    success = True
    success = check_intent_with_function_handler_exists(training_data, 'queries.couponCode', 'couponCode') and success
    success = check_intent_with_function_handler_exists(training_data, 'queries.productPrice', 'productPrice') and success
    success = check_intent_with_function_handler_exists(training_data, 'queries.functionTest', 'testFunction') and success
    if success:
        logger.info(f"Chatbot training data {colors.bold(utils.extract_filename(config.get('application.chatBot.trainingData')))} validated ({colors.green('OK')})")
    else:
        logger.warn(f"Chatbot training data {colors.bold(utils.extract_filename(config.get('application.chatBot.trainingData')))} validated ({colors.red('NOT OK')})")
        logger.warn(f"Visit {colors.yellow('https://pwning.owasp-juice.shop/appendix/chatbot.html')} for the training data schema definition.")
        if exit_on_failure:
            logger.error(colors.red('Exiting due to configuration errors!'))
            exit(1)
    return success

def check_intent_with_function_handler_exists(training_data, intent, handler):
    success = True
    intent_data = [data for data in training_data['data'] if data['intent'] == intent]
    if not intent_data:
        logger.warn(f"Intent {colors.italic(intent)} is missing in chatbot training data ({colors.red('NOT OK')})")
        success = False
    else:
        if not any(answer['action'] == 'function' and answer['handler'] == handler for answer in intent_data[0]['answers']):
            logger.warn(f"Answer with {colors.italic('function')} action and handler {colors.italic(handler)} is missing for intent {colors.italic(intent)} ({colors.red('NOT OK')})")
            success = False
    return success
