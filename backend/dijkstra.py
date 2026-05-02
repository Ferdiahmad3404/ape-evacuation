import heapq
from math import radians, sin, cos, sqrt, atan2

def dijkstra(graph, start_node, end_node, walking_speed):
    times = {node: float('inf') for node in graph}
    times[start_node] = 0
    priority_queue = [(0, start_node)]
    previous_nodes = {node: None for node in graph}

    while priority_queue:
        current_time, current_node = heapq.heappop(priority_queue)

        if current_node == end_node:
            break

        if current_time > times[current_node]:
            continue

        for neighbor, data in graph[current_node].items():
            edge_time = data['cost'] / walking_speed
            new_time = current_time + edge_time

            if new_time < times[neighbor]:
                times[neighbor] = new_time
                previous_nodes[neighbor] = current_node
                heapq.heappush(priority_queue, (new_time, neighbor))

    return times, previous_nodes

def dijkstra_with_rst(graph, start_node, end_node, t_warning, t_reaction, walking_speed):
    times = {node: float('infinity') for node in graph}
    times[start_node] = 0.0
    priority_queue = [(0.0, start_node)]
    previous_nodes = {node: None for node in graph}

    while priority_queue:
        current_time, current_node = heapq.heappop(priority_queue)

        if current_node == end_node:
            break

        if current_time > times[current_node]:
            continue

        for neighbor, data in graph[current_node].items():
            edge_time = data['cost'] / walking_speed

            new_time = current_time + edge_time

            rst = data['ETA'] - t_warning - t_reaction

            if new_time >= rst:
                continue

            if new_time < times[neighbor]:
                times[neighbor] = new_time
                previous_nodes[neighbor] = current_node
                heapq.heappush(priority_queue, (new_time, neighbor))

    return times, previous_nodes

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

    R = 6371.0

    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(float(lat2))
    lon2_rad = radians(float(lon2))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    return distance

def get_nearest_node(nodes, long, lat):
    nearest_node = None
    min_distance = float('infinity')

    for node_id, data in nodes.items():
        node_long = data['x']
        node_lat = data['y']
        distance = haversine_distance(lat, long, node_lat, node_long)

        if distance < min_distance:
            min_distance = distance
            nearest_node = node_id

    return nearest_node