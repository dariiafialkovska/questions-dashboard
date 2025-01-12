FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy all files into the container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV FLASK_APP=app
ENV FLASK_ENV=development

# Expose port for Flask
EXPOSE 5000

COPY data /app/data

# Copy the seed script into the container
COPY data_seed.py /app/data_seed.py

# Default command to run Flask in debug mode
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
