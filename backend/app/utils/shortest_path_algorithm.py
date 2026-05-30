import math, json

import json

def dijkstra(graph, source, target, walking_speed):
    dist = {}
    prev = {}
    visited = {}

    for v in graph:
        dist[v] = float('inf')
        prev[v] = None
        visited[v] = False

    dist[source] = 0
    queue = {source}

    while queue:
        u = min(queue, key=lambda vertex: dist[vertex])
        queue.remove(u)

        visited[u] = True

        if u == target:
            break

        neighbors = graph[u]["neighbors"]

        for v, edge in neighbors.items():

            if v not in visited:
                continue

            if visited[v]:
                continue
            
            alt = dist[u] + ((edge['length'] / walking_speed) / 60)

            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                queue.add(v)

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

            if v not in visited:
                continue

            if visited.get(v, False):
                continue

            if edge.get("eta") is not None:
                rst = edge["eta"] - (t_warning + t_reaction)
            else:
                rst = float("inf")

            alt = dist[u] + ((edge['length'] / walking_speed) / 60)

            if not alt < rst:
                continue

            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                queue[v] = True

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

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

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

def get_geometry_by_node_id(edges, node_ids):
    geometries = []

    for i, node_id in enumerate(node_ids[:-1]):
        next_node = node_ids[i + 1]

        for edge in edges.values():

            if edge['u'] == node_id and edge['v'] == next_node:
                geometry = json.loads(edge['geometry'])
                geometries.append(geometry)
                break

    return geometries

def geometry_distance(geometry):
    total_distance = 0

    for i in range(len(geometry) - 1):
        total_distance += haversine_distance(
            float(geometry[i][0]),
            float(geometry[i][1]),
            float(geometry[i + 1][0]),
            float(geometry[i + 1][1])
        )

    return total_distance

def split_geometry_into_safe_and_unsafe(
    geometries,
    walking_speed,
    safe_time_threshold
):
    result = {
        "safe": [],
        "unsafe": []
    }

    cumulative_distance = 0

    for geometry in geometries:
        segment_distance = geometry_distance(geometry)
        
        cumulative_distance += segment_distance

        travel_time = (cumulative_distance / walking_speed) / 60

        if travel_time < safe_time_threshold:
            result["safe"].append(geometry)
        else:
            result["unsafe"].append(geometry)

    return result