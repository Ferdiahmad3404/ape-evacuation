import heapq

def dijkstra(graph, start_node, end_node):
    distances = {node: float('infinity') for node in graph}
    distances[start_node] = 0
    priority_queue = [(0, start_node)]
    previous_nodes = {node: None for node in graph}

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_node == end_node:
            break

        if current_distance > distances[current_node]:
            continue

        for neighbor, data in graph[current_node].items():
            distance = current_distance + data['cost']

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(priority_queue, (distance, neighbor))

    return distances, previous_nodes

import heapq

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