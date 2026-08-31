#!/usr/bin/env python3
"""
YatraSetu Flyway Migration Runner for Supabase
Runs Spring Boot with Flyway enabled using credentials from .env.
Never prints passwords or secrets.
"""

import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, '.env')
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')

def load_env():
    env = os.environ.copy()
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip("'").strip('"')
    env['FLYWAY_ENABLED'] = 'true'
    return env

def run_migrations():
    env = load_env()
    print("Starting Spring Boot / Flyway migration execution...")
    cmd = ["./mvnw", "compile", "spring-boot:run", "-Dspring-boot.run.arguments=--spring.main.web-application-type=none"]
    
    # We run until flyway completes
    process = subprocess.Popen(
        cmd,
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    for line in process.stdout:
        # Filter out password-sensitive log lines if any
        if "password" in line.lower() and "jdbc" in line.lower():
            continue
        if "Flyway Community Edition" in line or "Migrating schema" in line or "Successfully applied" in line or "Current version" in line or "Database: jdbc:postgresql" in line:
            print(f"[Flyway Log] {line.strip()}")
        elif "ERROR" in line or "Exception" in line or "MigrationChecksumException" in line or "FlywayException" in line:
            print(f"[Error] {line.strip()}")
        elif "Started YatrasetuApplication" in line:
            print("[Success] Spring Boot initialized and all migrations completed successfully.")
            process.terminate()
            break

    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()

if __name__ == '__main__':
    run_migrations()
