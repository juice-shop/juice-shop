# Juice Shop Log Analysis Script
# This script analyzes log files from OWASP Juice Shop application
# and provides insights on security events, traffic patterns, and potential attacks

import pandas as pd
import re
import json
import csv
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from collections import Counter
import numpy as np
import io

# Function to upload and read log file
def upload_log_file():
    filename = "juice_logs_combined.csv"
    
    if filename.endswith('.csv'):
        df = pd.read_csv(filename)
        return df, filename
    else:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        return content, filename

# Function to parse different log formats
def parse_logs(log_content, format_type='csv'):
    """Parse logs based on the format type"""
    if isinstance(log_content, pd.DataFrame):
        return log_content  # Already a dataframe
        
    if format_type == 'csv':
        # Try to parse as CSV
        return pd.read_csv(io.StringIO(log_content))
    
    elif format_type == 'json':
        # Parse JSON logs (one JSON object per line)
        logs = []
        for line in log_content.splitlines():
            if line.strip():
                try:
                    logs.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        return pd.DataFrame(logs)
    
    elif format_type == 'common_log':
        # Parse Common Log Format
        pattern = r'(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+) (\S+)" (\d+) (\S+)'
        logs = []
        for line in log_content.splitlines():
            match = re.search(pattern, line)
            if match:
                host, identity, user, date, method, path, protocol, status, size = match.groups()
                logs.append({
                    'host': host,
                    'identity': identity,
                    'user': user,
                    'date': date,
                    'method': method,
                    'path': path,
                    'protocol': protocol,
                    'status': int(status),
                    'size': size
                })
        return pd.DataFrame(logs)
    
    else:
        # Generic line-by-line parser (try to detect format)
        lines = log_content.splitlines()
        
        # Try to detect if it's space or comma separated
        if ',' in lines[0]:
            reader = csv.reader(io.StringIO(log_content))
            headers = next(reader)
            data = [row for row in reader]
            return pd.DataFrame(data, columns=headers)
        else:
            # Simple space-separated parsing as fallback
            data = []
            for line in lines:
                if line.strip():
                    data.append(line.split())
            return pd.DataFrame(data)

# Function to detect common security events
def detect_security_events(df):
    security_events = {
        'sql_injection': [],
        'xss_attempts': [],
        'path_traversal': [],
        'authentication_failures': [],
        'admin_access': [],
        'api_abuse': [],
        'file_uploads': []
    }
    
    # Define patterns for different security events
    patterns = {
        'sql_injection': [r"'--", r"'; ?--", r"DROP", r"SELECT.*FROM", r"UNION.*SELECT", r"OR 1=1"],
        'xss_attempts': [r"<script>", r"javascript:", r"onerror=", r"onload=", r"eval\("],
        'path_traversal': [r"\.\.\/", r"%2e%2e%2f", r"etc/passwd", r"\.\.\\"],
        'admin_access': [r"/admin", r"/administrator", r"admin\.php"],
    }
    
    # Detect which columns might contain URL or request data
    url_columns = [col for col in df.columns if any(c in col.lower() for c in ['url', 'path', 'request', 'endpoint'])]
    status_columns = [col for col in df.columns if any(c in col.lower() for c in ['status', 'code', 'response'])]
    method_columns = [col for col in df.columns if any(c in col.lower() for c in ['method', 'verb', 'http'])]
    
    # Process URL columns for security patterns
    for col in url_columns:
        if col in df.columns:
            for event_type, event_patterns in patterns.items():
                for pattern in event_patterns:
                    matches = df[df[col].astype(str).str.contains(pattern, regex=True, na=False)]
                    for _, row in matches.iterrows():
                        security_events[event_type].append({
                            'timestamp': row.get('timestamp', row.get('date', 'unknown')),
                            'url': row[col],
                            'pattern': pattern,
                            'full_request': row.to_dict()
                        })
    
    # Check for authentication failures
    if any(col in df.columns for col in status_columns):
        status_col = next((col for col in status_columns if col in df.columns), None)
        if status_col:
            auth_failures = df[df[status_col].astype(str).isin(['401', '403'])]
            for _, row in auth_failures.iterrows():
                url_col = next((col for col in url_columns if col in row.index), None)
                url = row[url_col] if url_col else 'unknown'
                security_events['authentication_failures'].append({
                    'timestamp': row.get('timestamp', row.get('date', 'unknown')),
                    'url': url,
                    'status': row[status_col],
                    'full_request': row.to_dict()
                })
    
    # Check for API abuse (high frequency of calls)
    if any(col in df.columns for col in method_columns) and any(col in df.columns for col in url_columns):
        method_col = next((col for col in method_columns if col in df.columns), None)
        url_col = next((col for col in url_columns if col in df.columns), None)
        if method_col and url_col:
            api_endpoints = df[df[url_col].astype(str).str.contains('/api/', na=False)]
            if not api_endpoints.empty:
                api_counts = api_endpoints.groupby([method_col, url_col]).size().reset_index(name='count')
                suspicious_apis = api_counts[api_counts['count'] > 10]  # Threshold for suspicious activity
                for _, row in suspicious_apis.iterrows():
                    security_events['api_abuse'].append({
                        'method': row[method_col],
                        'url': row[url_col],
                        'count': row['count']
                    })
    
    return security_events

# Function to visualize log data
def visualize_logs(df):
    """Create visualizations from log data"""
    plt.figure(figsize=(15, 10))
    
    # 1. Status code distribution
    status_columns = [col for col in df.columns if any(c in col.lower() for c in ['status', 'code', 'response'])]
    if status_columns:
        status_col = status_columns[0]
        plt.subplot(2, 2, 1)
        status_counts = df[status_col].astype(str).value_counts().sort_index()
        status_counts.plot(kind='bar', color='skyblue')
        plt.title('HTTP Status Code Distribution')
        plt.xlabel('Status Code')
        plt.ylabel('Count')
        plt.xticks(rotation=45)
    
    # 2. Request methods distribution
    method_columns = [col for col in df.columns if any(c in col.lower() for c in ['method', 'verb', 'http'])]
    if method_columns:
        method_col = method_columns[0]
        plt.subplot(2, 2, 2)
        df[method_col].value_counts().plot(kind='pie', autopct='%1.1f%%')
        plt.title('HTTP Methods Distribution')
    
    # 3. Top requested endpoints
    url_columns = [col for col in df.columns if any(c in col.lower() for c in ['url', 'path', 'request', 'endpoint'])]
    if url_columns:
        url_col = url_columns[0]
        plt.subplot(2, 2, 3)
        
        # Extract endpoints from URLs
        def extract_endpoint(url):
            if pd.isna(url):
                return 'unknown'
            match = re.search(r'/[^?#]*', str(url))
            return match.group(0) if match else url
        
        endpoints = df[url_col].apply(extract_endpoint)
        top_endpoints = endpoints.value_counts().head(10)
        top_endpoints.plot(kind='barh', color='lightgreen')
        plt.title('Top 10 Requested Endpoints')
        plt.xlabel('Count')
    
    # 4. Traffic over time (if timestamp available)
    time_columns = [col for col in df.columns if any(c in col.lower() for c in ['time', 'date', 'timestamp'])]
    if time_columns:
        time_col = time_columns[0]
        try:
            # Convert to datetime if not already
            if not pd.api.types.is_datetime64_any_dtype(df[time_col]):
                df['datetime'] = pd.to_datetime(df[time_col], errors='coerce')
            else:
                df['datetime'] = df[time_col]
            
            plt.subplot(2, 2, 4)
            df.set_index('datetime').resample('1H').size().plot(color='coral')
            plt.title('Traffic Over Time')
            plt.xlabel('Time')
            plt.ylabel('Number of Requests')
        except Exception as e:
            print(f"Could not plot time series: {e}")
    
    plt.tight_layout()
    plt.show()

# Function to analyze security metrics
def analyze_security_metrics(df, security_events):
    """Calculate and display security metrics"""
    print("===== SECURITY METRICS =====")
    
    # Total number of detected security events
    total_events = sum(len(events) for events in security_events.values())
    print(f"Total security events detected: {total_events}")
    
    # Breakdown by event type
    print("\nBreakdown by event type:")
    for event_type, events in security_events.items():
        print(f"  - {event_type}: {len(events)}")
    
    # Status code analysis
    status_columns = [col for col in df.columns if any(c in col.lower() for c in ['status', 'code', 'response'])]
    if status_columns:
        status_col = status_columns[0]
        # Group status codes by class (2xx, 4xx, 5xx)
        df['status_str'] = df[status_col].astype(str)
        df['status_class'] = df['status_str'].str[0] + 'xx'
        status_class_counts = df['status_class'].value_counts()
        
        print("\nHTTP Status Code Classes:")
        for status_class, count in status_class_counts.items():
            print(f"  - {status_class}: {count} ({count/len(df)*100:.1f}%)")
        
        # Error rates
        error_rate = (status_class_counts.get('4xx', 0) + status_class_counts.get('5xx', 0)) / len(df) * 100
        print(f"\nError rate (4xx + 5xx): {error_rate:.2f}%")
    
    # Plot security events by type
    event_counts = {event_type: len(events) for event_type, events in security_events.items() if len(events) > 0}
    if event_counts:
        plt.figure(figsize=(10, 6))
        plt.bar(event_counts.keys(), event_counts.values(), color='firebrick')
        plt.title('Security Events by Type')
        plt.xlabel('Event Type')
        plt.ylabel('Count')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

# Function to generate security recommendations
def generate_recommendations(security_events):
    """Generate security recommendations based on findings"""
    recommendations = []
    
    # Check for SQL injection
    if security_events['sql_injection']:
        recommendations.append(
            "SQL Injection vulnerabilities detected. Implement proper input validation and "
            "parameterized queries. Consider using an ORM or prepared statements."
        )
    
    # Check for XSS
    if security_events['xss_attempts']:
        recommendations.append(
            "Cross-Site Scripting (XSS) attempts detected. Implement Content-Security-Policy "
            "headers and proper output encoding. Sanitize user inputs before rendering."
        )
    
    # Check for path traversal
    if security_events['path_traversal']:
        recommendations.append(
            "Path traversal attempts detected. Validate and sanitize file paths, use whitelists "
            "for allowed files, and avoid passing user input directly to file system functions."
        )
    
    # Check for authentication failures
    if len(security_events['authentication_failures']) > 10:
        recommendations.append(
            "High number of authentication failures detected. Implement rate limiting, account "
            "lockout policies, and CAPTCHA after multiple failed attempts."
        )
    
    # Check for admin access
    if security_events['admin_access']:
        recommendations.append(
            "Multiple attempts to access admin interfaces detected. Consider IP restrictions for "
            "admin areas, two-factor authentication, and monitoring for these access patterns."
        )
    
    # Check for API abuse
    if security_events['api_abuse']:
        recommendations.append(
            "Potential API abuse detected. Implement rate limiting, API keys, and proper "
            "authentication for API endpoints. Monitor for unusual patterns of API usage."
        )
    
    # Add general recommendations if few specific issues found
    if len(recommendations) < 3:
        recommendations.extend([
            "Implement regular security scanning and penetration testing for your application.",
            "Keep all dependencies and frameworks up-to-date with security patches.",
            "Implement proper logging and monitoring to detect security incidents."
        ])
    
    return recommendations

# Main function to run the analysis
def main():
    print("=" * 50)
    print("JUICE SHOP LOG ANALYSIS TOOL")
    print("=" * 50)
    
    # Step 1: Upload and read the log file
    try:
        log_data, filename = upload_log_file()
        print(f"\nSuccessfully uploaded: {filename}")
        
        # Step 2: Determine format and parse logs
        format_type = 'csv' if filename.endswith('.csv') else 'unknown'
        df = parse_logs(log_data, format_type)
        
        print(f"\nLog file parsed successfully. Found {len(df)} records.")
        print("\nSample data:")
        print(df.head())
        
        # Step 3: Analyze logs for security events
        print("\nAnalyzing logs for security events...")
        security_events = detect_security_events(df)
        
        # Step 4: Visualize log data
        print("\nGenerating visualizations...")
        visualize_logs(df)
        
        # Step 5: Analyze security metrics
        analyze_security_metrics(df, security_events)
        
        # Step 6: Generate recommendations
        recommendations = generate_recommendations(security_events)
        print("\n===== SECURITY RECOMMENDATIONS =====")
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")
        
        # Step 7: Allow saving results to CSV
        event_results = []
        for event_type, events in security_events.items():
            for event in events:
                event_data = {'event_type': event_type}
                event_data.update(event)
                event_results.append(event_data)
        
        if event_results:
            events_df = pd.DataFrame(event_results)
            events_df.to_csv('security_events.csv', index=False)
            print("\nSecurity events saved to 'security_events.csv'")
        
        print("\nAnalysis complete!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
