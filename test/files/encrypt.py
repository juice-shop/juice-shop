confidential_document = open('announcement.md', 'r')

#  Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
#  SPDX-License-Identifier: MIT

# Public Parameters
N = 145906768007583323230186939349070635292401872375357164399581871019873438799005358938369571402670149802121818086292467422828157022922076746906543401224889672472407926969987100581290103199317858753663710862357656510507883714297115637342788911463535102712032765166518411726859837988672111837205085526346618740053
e = 65537

encrypted_document = open('announcement_encrypted.md', 'w')

# Encrypt the document!
for char in confidential_document.read():
    encrypted_document.write(str(pow(ord(char), e, N)) + '\n')

# Save the file
encrypted_document.close()
