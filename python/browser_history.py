import sqlite3
import csv
import sys
import re
import os
from urllib.parse import unquote
import glob
import argparse

def query_chrome(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            url,
            title,
            datetime(last_visit_time/1000000 - 11644473600, 'unixepoch') as visit_time_utc
        FROM urls
        ORDER BY last_visit_time DESC;
    """)
    return cursor.fetchall()

def query_safari(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            url,
            title,
            datetime(visit_time + 978307200, 'unixepoch') as visit_time_utc
        FROM history_items
        JOIN history_visits ON history_items.id = history_visits.history_item
        ORDER BY visit_time DESC;
    """)
    return cursor.fetchall()

def query_firefox(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            url,
            title,
            datetime(last_visit_date/1000000, 'unixepoch') as visit_time_utc
        FROM moz_places
        ORDER BY last_visit_date DESC;
    """)
    return cursor.fetchall()

def get_username_from_path(database_file):
    try:
        try:
            parent_dir = database_file.split("/")[database_file.split("/").index("Users")+1]
        except ValueError:
            parent_dir = database_file.split("/")[database_file.split("/").index("Library")-1]
        return parent_dir
    except ValueError:
        return "Anon_User"
        
def setup_argparse():
    parser = argparse.ArgumentParser(description='Automatically find and process browser history databases within a specified directory to export the browsing history into CSV format.')
    parser.add_argument('directory', nargs='?', default=os.getcwd(), help='Directory to search for browser history database files. Defaults to the current working directory if not specified.')
    return parser.parse_args()

def main():
    args = setup_argparse()
    directory = args.directory

    # Patterns for different browser database files
    patterns = ['**/History.db', '**/History', '**/places.sqlite']
    database_files = []
    for pattern in patterns:
        database_files.extend(glob.glob(os.path.join(directory, pattern), recursive=True))

    if not database_files:
        print(f"No database files found in {directory}.")
        return

    processing_results = []

    for database_file in database_files:
        output_file = database_file + ".csv"
        parent_dir = get_username_from_path(database_file)

        try:
            conn = sqlite3.connect(database_file)

            if re.search("^History.*$", os.path.basename(database_file)):
                if ".db" in database_file:
                    data = query_safari(conn)
                else:
                    data = query_chrome(conn)
            elif re.search("^places.sqlite$", os.path.basename(database_file)):
                data = query_firefox(conn)
            else:
                print(f"Unknown database file: {database_file}")
                continue  # Skip unknown files

            conn.close()

            data = [(row[0], row[1], row[2], parent_dir, " ".join(" ".join(unquote(row[0]).split("&")).split("?")).split(" ")) for row in data]

            with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['URL', 'Title', 'Visit Time UTC', 'Parent Directory', 'Decoded URL Params'])
                writer.writerows(data)

            processing_results.append((output_file, f"Converted: '{database_file}'", "success"))

        except sqlite3.DatabaseError as e:
            processing_results.append((database_file, f"Error: {e}", "error"))

    processing_results.sort(key=lambda x: x[2])
    for file, message, status in processing_results:
        color_code = "\033[91m" if status == "error" else "\033[92m"  # Red for error, green for success
        print(f"{color_code}{message} -> '{file}'\033[0m")   

if __name__ == "__main__":
    main()
