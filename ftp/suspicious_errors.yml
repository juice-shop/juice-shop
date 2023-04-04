title: Suspicious error messages specific to the application
description: Detects error messages that only occur from tampering with or attacking the application
author: Bjoern Kimminich
logsource:
    category: application
    product: nodejs
    service: errorhandler
detection:
    keywords:
        - 'Blocked illegal activity'
        - '* with id=* does not exist'
        - 'Only * files are allowed'
        - 'File names cannot contain forward slashes'
        - 'Unrecognized target URL for redirect: *'
        - 'B2B customer complaints via file upload have been deprecated for security reasons'
        - 'Infinite loop detected'
        - 'Detected an entity reference loop'
    condition: keywords
level: low