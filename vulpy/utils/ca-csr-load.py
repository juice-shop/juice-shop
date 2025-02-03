#!/usr/bin/env python3

import datetime

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes


with open("/tmp/ca.cert", "rb") as ca_cert_file:
    ca_cert = x509.load_pem_x509_certificate(ca_cert_file.read(), default_backend())

with open("/tmp/acme.csr", "rb") as csr_file:
    csr = x509.load_pem_x509_csr(csr_file.read(), default_backend())

with open("/tmp/ca.key", "rb") as key_file:
    private_key = serialization.load_pem_private_key(
        key_file.read(),
        password=None,
        backend=default_backend()
    )

cert = x509.CertificateBuilder().subject_name(csr.subject)
cert = cert.issuer_name(ca_cert.subject)
cert = cert.public_key(csr.public_key())
cert = cert.serial_number(x509.random_serial_number())
cert = cert.not_valid_before(datetime.datetime.utcnow())
cert = cert.not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=30))
cert = cert.sign(private_key, hashes.SHA256(), default_backend())

# Write our certificate out to disk.
with open('/tmp/acme.cert', 'wb') as out:
    out.write(cert.public_bytes(serialization.Encoding.PEM))

print('Created /tmp/acme.cert')
