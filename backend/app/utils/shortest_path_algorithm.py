import math, json

def dijkstra(graph, source, target, walking_speed):
    dist = {}
    prev = {}
    visited = {}
    queue = {}

    for v in graph:
        dist[v] = float("inf")
        prev[v] = None
        visited[v] = False
        queue[v] = False

    dist[source] = 0
    queue[source] = True

    while any(queue.values()):

        active_nodes = [v for v in queue if queue[v]]
        u = min(active_nodes, key=lambda vertex: dist[vertex])

        if u == target:
            break

        queue[u] = False
        visited[u] = True

        neighbors = graph[u]["neighbors"]

        for v, edge in neighbors.items():

            if visited[v]:
                continue

            alt = dist[u] + round(edge["length"], 2)

            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                queue[v] = True

    return dist, prev


def dijkstra_with_rst(
    graph,
    source,
    target,
    t_warning,
    t_reaction,
    walking_speed
):
    dist = {}
    prev = {}
    visited = {}
    queue = {}

    for v in graph:
        dist[v] = float("inf")
        prev[v] = None
        visited[v] = False
        queue[v] = False

    dist[source] = 0
    queue[source] = True

    while any(queue.values()):

        active_nodes = [v for v in queue if queue[v]]
        u = min(active_nodes, key=lambda vertex: dist[vertex])

        if u == target:
            break

        queue[u] = False
        visited[u] = True

        neighbors = graph[u]["neighbors"]

        for v, edge in neighbors.items():

            if visited[v]:
                continue

            if edge.get("eta") is not None:
                rst = edge["eta"] - (t_warning + t_reaction)
            else:
                rst = float("inf")

            alt = dist[u] + round(edge["length"], 2)

            if ((alt / walking_speed) / 60) < rst:

                if alt < dist[v]:
                    dist[v] = alt
                    prev[v] = u
                    queue[v] = True

            else:
                continue

    return dist, prev

def reconstruct_path(previous_nodes, start_node, end_node):
    path = []
    current = end_node

    while current is not None:
        path.insert(0, current)
        current = previous_nodes[current]

    if not path or path[0] != start_node:
        return []

    return path

def haversine_distance(lat1, lon1, lat2, lon2, radius=6371000):
    latitude1 = math.radians(lat1)
    latitude2 = math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(latitude1) * math.cos(latitude2) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c

def find_nearest_node(nodes, latitude, longitude):
    nearest_node = None
    min_distance = float('inf')

    for node_id, node in nodes.items():
        node_lat = node['latitude']
        node_lon = node['longitude']

        if node_lat is not None and node_lon is not None:
            distance = haversine_distance(latitude, longitude, node_lat, node_lon)

            if distance < min_distance and node['status'] == "intersection":
                min_distance = distance
                nearest_node = node['node_id']

    return nearest_node

def get_geometry_by_node_id(nodes, node_ids):
    geometries = []

    for node_id in node_ids:
        for node in nodes.values():
            if node['node_id'] == node_id:
                geometry = [node['latitude'], node['longitude']]
                geometries.append(geometry)
                break

    return geometries

def get_node_information_by_node_id(nodes, node_ids):
    node_information = []

    for node_id in node_ids:
        for node in nodes.values():
            if node['node_id'] == node_id:
                node_info = {
                    "node_id": node['node_id'],
                    "latitude": node['latitude'],
                    "longitude": node['longitude'],
                    "status": node['status'],
                    "eta": node.get('eta'),
                    "name": node['name']
                }
                node_information.append(node_info)
                break

    return node_information

def get_edge_information_by_node_id(edges, node_ids):
    edge_information = []

    for i in range(len(node_ids) - 1):
        u = node_ids[i]
        v = node_ids[i + 1]

        edge_key = f"{u}_{v}"
        reverse_edge_key = f"{v}_{u}"

        edge_data = (
            edges.get(edge_key)
            or edges.get(reverse_edge_key)
        )

        if edge_data:
            edge_information.append({
                "u": edge_data["u"],
                "v": edge_data["v"],
                "length": edge_data["length"],
            })

    return edge_information

def project_point_to_segment(ax, ay, bx, by, px, py):
    abx = bx - ax
    aby = by - ay

    apx = px - ax
    apy = py - ay

    ab2 = abx*abx + aby*aby

    if ab2 == 0:
        return ax, ay, 0

    t = (apx*abx + apy*aby) / ab2
    t = max(0, min(1, t))

    qx = ax + t * abx
    qy = ay + t * aby

    return qx, qy, t


def latlon_to_xy(lat, lon):
    R = 6371000
    x = math.radians(lon) * R * math.cos(math.radians(lat))
    y = math.radians(lat) * R
    return x, y