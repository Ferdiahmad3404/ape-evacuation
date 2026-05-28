import math

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

        for v, edge in graph[u].items():

            if visited[v]:
                continue

            alt = dist[u] + (edge['cost'] / walking_speed)

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

        for v, edge in graph[u].items():

            if visited.get(v, False):
                continue

            cost = edge["cost"]
            rst = edge["eta"] - (t_warning + t_reaction)

            alt = dist[u] + (cost / walking_speed)

            if alt >= rst and rst != float("inf"):
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

    for node in nodes:
        node_lat = node['latitude']
        node_lon = node['longitude']

        if node_lat is not None and node_lon is not None:
            distance = haversine_distance(latitude, longitude, node_lat, node_lon)

            if distance < min_distance and node['status'] == "intersection":
                min_distance = distance
                nearest_node = node['node_id']

    return nearest_node