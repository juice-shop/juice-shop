FROM python:3.9-slim

WORKDIR /app

COPY src/ /app/

# Vulnerability: Using root user
RUN pip install flask requests

EXPOSE 5000

CMD ["python", "app.py"] 