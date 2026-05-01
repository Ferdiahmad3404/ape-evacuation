import os
import psycopg2
import json

# cache graph biar tidak rebuild terus
G = None

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "ape_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "junior221"),
    )

def build_graph():
    conn = get_db_connection()
    cur = conn.cursor()

    graph = {}

    cur.execute("SELECT node, neighbors FROM graph")

    rows = cur.fetchall()

    for node, neighbors in rows:
        node_id = str(node)

        if isinstance(neighbors, dict):
            graph[node_id] = neighbors
        else:
            graph[node_id] = json.loads(neighbors)

    cur.close()
    conn.close()

    return graph

def get_graph():
    global G
    if G is None:
        print("Loading graph from DB...")
        G = build_graph()
    return G

def get_evacuation_points():
    conn = get_db_connection()
    cur = conn.cursor()

    evacuation_points = {}

    cur.execute("SELECT osmid, nama_tempat, status_tempat, x, y FROM evacuation_points")

    rows = cur.fetchall()

    for osmid, nama_tempat, status_tempat, x, y in rows:
        evacuation_points[str(osmid)] = {
            "nama_tempat": nama_tempat,
            "status_tempat": status_tempat,
            "x": x,
            "y": y,
            "is_evacuation_point": True
        }

    cur.close()
    conn.close()

    return evacuation_points

def replace_evacuation_points(new_points):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM evacuation_points")

    for point in new_points:
        osmid = point["osmid"]
        nama_tempat = point["nama_tempat"]
        status_tempat = point["status_tempat"]
        x = point["x"]
        y = point["y"]
        geometry = point["geometry"]
        osmid1 = point["osmid1"]
        osmid2 = point["osmid2"]

        cur.execute(
            "INSERT INTO evacuation_points (osmid, nama_tempat, status_tempat, x, y, geometry, osmid1, osmid2) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (osmid, nama_tempat, status_tempat, x, y, geometry, osmid1, osmid2)
        )

    conn.commit()
    cur.close()
    conn.close()

def get_scenario():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT x, y, magnitude FROM meta LIMIT 1")
    row = cur.fetchone()

    cur.close()
    conn.close()

    if row is None:
        return None

    x, y, magnitude = row
    return {
        "x": x,
        "y": y,
        "magnitude": magnitude
    }
    
